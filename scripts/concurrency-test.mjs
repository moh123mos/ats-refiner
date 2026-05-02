import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import { performance } from 'node:perf_hooks'

const PORT = Number(process.env.CONCURRENCY_PORT || 3002)
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`
const LEVELS = (process.env.CONCURRENCY_LEVELS || '1,2,5,10,20,500,1000')
  .split(',')
  .map(value => Number(value.trim()))
  .filter(Number.isFinite)
const REQUESTS_PER_LEVEL = Number(process.env.REQUESTS_PER_LEVEL || 20)

const resumeBytes = await fs.readFile('tests/fixtures/CV.pdf')
const jobDescription = await fs.readFile('tests/fixtures/job-title.txt', 'utf8')

let serverProcess

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForServer() {
  const deadline = Date.now() + 60000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE_URL)
      if (response.ok) return
    } catch {
      // Server is still starting.
    }
    await sleep(500)
  }
  throw new Error(`Server did not become ready at ${BASE_URL}`)
}

function startServerIfNeeded() {
  if (process.env.BASE_URL) return

  serverProcess = spawn(process.execPath, ['node_modules/nuxt/bin/nuxt.mjs', 'dev', '--port', String(PORT)], {
    env: {
      ...process.env,
      MOCK_AI: 'true',
      GEMINI_API_KEY: '',
      NUXT_GEMINI_API_KEY: ''
    },
    stdio: ['ignore', 'pipe', 'pipe']
  })

  serverProcess.stdout.on('data', chunk => {
    process.stdout.write(`[server] ${chunk}`)
  })
  serverProcess.stderr.on('data', chunk => {
    process.stderr.write(`[server] ${chunk}`)
  })
  serverProcess.on('exit', code => {
    if (code !== null && code !== 0) {
      console.error(`[server] exited with code ${code}`)
    }
  })
}

async function runUserFlow() {
  const startedAt = performance.now()

  const formData = new FormData()
  formData.append(
    'file',
    new Blob([resumeBytes], { type: 'application/pdf' }),
    'CV.pdf'
  )

  const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData
  })
  const uploadJson = await uploadResponse.json()

  if (!uploadResponse.ok || !uploadJson.success || !uploadJson.data?.sessionId) {
    throw new Error(`Upload failed: ${JSON.stringify(uploadJson)}`)
  }

  const analyzeResponse = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      sessionId: uploadJson.data.sessionId,
      jobDescription
    })
  })
  const analyzeJson = await analyzeResponse.json()

  if (!analyzeResponse.ok || !analyzeJson.success) {
    throw new Error(`Analyze failed: ${JSON.stringify(analyzeJson)}`)
  }

  return performance.now() - startedAt
}

async function runPool(concurrency, totalRequests) {
  const latencies = []
  const errors = []
  let nextRequest = 0

  async function worker() {
    while (nextRequest < totalRequests) {
      nextRequest += 1
      try {
        latencies.push(await runUserFlow())
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error))
      }
    }
  }

  const startedAt = performance.now()
  await Promise.all(
    Array.from({ length: concurrency }, () => worker())
  )
  const durationMs = performance.now() - startedAt

  latencies.sort((a, b) => a - b)
  const average = latencies.reduce((sum, value) => sum + value, 0) / (latencies.length || 1)
  const p95 = latencies[Math.max(0, Math.ceil(latencies.length * 0.95) - 1)] || 0

  return {
    concurrency,
    totalRequests,
    passed: latencies.length,
    failed: errors.length,
    averageMs: Math.round(average),
    p95Ms: Math.round(p95),
    requestsPerSecond: Number((latencies.length / (durationMs / 1000)).toFixed(2)),
    sampleError: errors[0]
  }
}

try {
  startServerIfNeeded()
  await waitForServer()

  console.log(`\n[concurrency] Base URL: ${BASE_URL}`)
  console.log(`[concurrency] Requests per level: ${REQUESTS_PER_LEVEL}`)
  console.log('[concurrency] Gemini mocked with MOCK_AI=true\n')
  console.log('| Concurrency | Passed | Failed | Avg ms | P95 ms | Req/s |')
  console.log('| :--- | ---: | ---: | ---: | ---: | ---: |')

  const results = []
  for (const level of LEVELS) {
    const result = await runPool(level, REQUESTS_PER_LEVEL)
    results.push(result)
    console.log(
      `| ${result.concurrency} | ${result.passed} | ${result.failed} | ${result.averageMs} | ${result.p95Ms} | ${result.requestsPerSecond} |`
    )
    if (result.sampleError) {
      console.log(`[concurrency] sample error at level ${level}: ${result.sampleError}`)
    }
  }

  const stable = results
    .filter(result => result.failed === 0)
    .at(-1)

  console.log(
    `\n[concurrency] Highest tested level with 0 failures: ${stable ? stable.concurrency : 'none'}`
  )
} finally {
  if (serverProcess) {
    serverProcess.kill()
  }
}
