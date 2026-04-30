<template>
  <div class="flex-1">
    <!-- Hero Section -->
    <div class="hero-bg relative">
      <div class="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-16">
        <!-- Floating badge -->
        <div class="flex justify-center mb-6 animate-fade-in-up">
          <span
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"
          >
            <span
              class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"
            />
            AI-Powered Resume Analysis
          </span>
        </div>

        <!-- Title -->
        <h1
          class="text-5xl md:text-6xl font-extrabold text-center leading-tight animate-fade-in-up delay-100"
        >
          <span class="text-white">Make Your Resume</span>
          <br>
          <span class="gradient-text">ATS-Ready</span>
        </h1>

        <!-- Subtitle -->
        <p
          class="text-lg text-slate-400 text-center mt-4 max-w-2xl mx-auto animate-fade-in-up delay-200"
        >
          Upload your resume, paste the job description, and get AI-powered analysis
          with actionable suggestions to improve your chances with ATS systems.
        </p>

        <!-- Features Row -->
        <div
          class="grid grid-cols-3 gap-4 mt-10 max-w-xl mx-auto animate-fade-in-up delay-300"
        >
          <div class="text-center">
            <div
              class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2"
            >
              <UIcon
                name="i-lucide-scan-search"
                class="w-5 h-5 text-green-400"
              />
            </div>
            <p class="text-xs text-slate-400">
              ATS Score Analysis
            </p>
          </div>
          <div class="text-center">
            <div
              class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2"
            >
              <UIcon
                name="i-lucide-target"
                class="w-5 h-5 text-green-400"
              />
            </div>
            <p class="text-xs text-slate-400">
              Keyword Matching
            </p>
          </div>
          <div class="text-center">
            <div
              class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2"
            >
              <UIcon
                name="i-lucide-lightbulb"
                class="w-5 h-5 text-green-400"
              />
            </div>
            <p class="text-xs text-slate-400">
              Improvement Tips
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Section -->
    <div class="max-w-2xl mx-auto px-4 mt-6 relative z-20 pb-16">
      <div
        class="glass rounded-2xl p-8 shadow-2xl shadow-black/20 border border-slate-700/50"
      >
        <!-- Upload Area -->
        <div
          class="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer"
          :class="[
            isDragging
              ? 'border-green-500 bg-green-500/10 scale-[1.01]'
              : 'border-slate-600 hover:border-green-400/50 hover:bg-slate-800/30'
          ]"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          @click="openFilePicker"
        >
          <div class="space-y-3">
            <div
              class="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-teal-500/20 flex items-center justify-center mx-auto animate-float"
            >
              <UIcon
                name="i-lucide-cloud-upload"
                class="w-7 h-7 text-green-400"
              />
            </div>
            <div>
              <p class="text-base font-semibold text-slate-200">
                Drop your resume here
              </p>
              <p class="text-sm text-slate-500 mt-1">
                PDF or DOCX • Max 10MB
              </p>
            </div>
            <UButton
              variant="outline"
              size="sm"
              color="neutral"
              @click.stop="openFilePicker"
            >
              <UIcon
                name="i-lucide-folder-open"
                class="w-4 h-4 mr-1.5"
              />
              Browse Files
            </UButton>
            <input
              ref="fileInput"
              type="file"
              accept=".pdf,.docx"
              class="hidden"
              @change="handleFileSelect"
            >
          </div>
        </div>

        <!-- Selected File Display -->
        <div
          v-if="selectedFile"
          class="flex items-center gap-3 mt-4 p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/50 animate-fade-in"
        >
          <div
            class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0"
          >
            <UIcon
              name="i-lucide-file-check-2"
              class="w-5 h-5 text-green-400"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-slate-200 truncate text-sm">
              {{ selectedFile.name }}
            </p>
            <p class="text-xs text-slate-500">
              {{ formatSize(selectedFile.size) }}
            </p>
          </div>
          <UButton
            variant="ghost"
            color="error"
            size="xs"
            @click="clearFile"
          >
            <UIcon
              name="i-lucide-x"
              class="w-4 h-4"
            />
          </UButton>
        </div>

        <!-- Job Description -->
        <div class="mt-5 space-y-2">
          <label
            class="flex items-center gap-2 text-sm font-medium text-slate-300"
          >
            <UIcon
              name="i-lucide-briefcase"
              class="w-4 h-4 text-slate-500"
            />
            Job Description
          </label>
          <UTextarea
            v-model="jobDescription"
            placeholder="Paste the job description here to get tailored recommendations..."
            :rows="5"
            :disabled="store.status === 'analyzing'"
            :ui="{
              root: '!inline-block w-full',
              base: 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder-slate-500 focus:border-green-500/50 focus:ring-green-500/20'
            }"
          />
          <p class="text-xs text-slate-600">
            Minimum 20 characters for meaningful analysis
          </p>
        </div>

        <!-- Submit Button -->
        <UButton
          color="primary"
          size="lg"
          block
          class="mt-5 font-semibold"
          :loading="isProcessing"
          :disabled="!canSubmit"
          @click="submitAnalysis"
        >
          <UIcon
            v-if="!isProcessing"
            name="i-lucide-sparkles"
            class="w-4 h-4 mr-2"
          />
          {{ submitButtonText }}
        </UButton>

        <!-- Error Display -->
        <div
          v-if="store.error"
          class="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in"
        >
          <div class="flex items-start gap-3">
            <UIcon
              name="i-lucide-alert-circle"
              class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
            />
            <div>
              <p class="font-medium text-red-300 text-sm">
                {{ store.error.message }}
              </p>
              <p
                v-if="store.error.hint"
                class="mt-1 text-xs text-red-400/80"
              >
                {{ store.error.hint }}
              </p>
              <p
                v-if="store.error.code || store.error.requestId"
                class="mt-2 text-xs text-red-500/60"
              >
                <span v-if="store.error.code">Code: {{ store.error.code }}</span>
                <span v-if="store.error.code && store.error.requestId">
                  —
                </span>
                <span v-if="store.error.requestId">Ref: {{ store.error.requestId }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import type { AnalyzeResponse, ApiErrorDetails, UploadResponse } from '~/types'

interface UiError {
  message: string
  code?: string
  hint?: string
  requestId?: string
}

const ERROR_HINTS: Record<string, string> = {
  PARSE_ERROR:
    'We could not read this file format safely. Please re-export your resume and try again.',
  PDF_PASSWORD_PROTECTED: 'Unlock the PDF first, then upload it again.',
  INVALID_PDF_CONTENT:
    'The PDF structure looks invalid. Re-export the file and retry.',
  EMPTY_CONTENT:
    'The file has little or no readable text. Use a text-based PDF or DOCX.',
  INVALID_MIME:
    'The file MIME type is not supported. Upload a valid PDF or DOCX.',
  UNSUPPORTED_TYPE: 'Only PDF and DOCX files are supported in this MVP.',
  FILE_TOO_LARGE: 'The file is larger than 10MB. Upload a smaller file.',
  ANALYSIS_ERROR: 'Analysis failed. Please retry in a moment.'
}

function toUiError(payload: {
  message: string
  errorCode?: string
  details?: ApiErrorDetails
}): UiError {
  return {
    message:
      payload.message || 'Something went wrong while processing your request.',
    code: payload.errorCode,
    hint:
      payload.details?.hint
      || (payload.errorCode ? ERROR_HINTS[payload.errorCode] : undefined),
    requestId: payload.details?.requestId
  }
}

function toNetworkError(error: unknown): UiError {
  return {
    message: 'Request failed before the server could complete processing.',
    hint:
      error instanceof Error
        ? error.message
        : 'Please check your network and try again.'
  }
}

const store = useSessionStore()
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const jobDescription = ref('')

const isProcessing = computed(
  () =>
    store.status === 'uploading'
    || store.status === 'parsing'
    || store.status === 'analyzing'
)

const canSubmit = computed(
  () =>
    selectedFile.value !== null
    && jobDescription.value.trim().length >= 20
    && !isProcessing.value
)

const submitButtonText = computed(() => {
  switch (store.status) {
    case 'uploading':
      return 'Uploading...'
    case 'parsing':
      return 'Parsing...'
    case 'analyzing':
      return 'Analyzing with AI...'
    case 'ready':
      return 'Analyze'
    default:
      return 'Analyze Resume'
  }
})

function openFilePicker() {
  fileInput.value?.click()
}

function isSupportedResumeFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.docx')
}

function rejectUnsupportedFile() {
  selectedFile.value = null
  store.setError(
    toUiError({
      message: 'Unsupported file type. Please upload PDF or DOCX.',
      errorCode: 'UNSUPPORTED_TYPE'
    })
  )
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.[0]) {
    const file = input.files[0]
    if (!isSupportedResumeFile(file)) {
      rejectUnsupportedFile()
      return
    }
    store.setError(null)
    selectedFile.value = file
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files?.[0]) {
    const file = files[0]
    if (!isSupportedResumeFile(file)) {
      rejectUnsupportedFile()
      return
    }
    store.setError(null)
    selectedFile.value = file
  }
}

function clearFile() {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function submitAnalysis() {
  if (!selectedFile.value || !jobDescription.value.trim()) return

  store.setStatus('uploading')
  store.setError(null)

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const uploadRes = await $fetch<UploadResponse>('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!uploadRes.success || !uploadRes.data) {
      store.setError(toUiError(uploadRes))
      return
    }

    store.setSession({
      sessionId: uploadRes.data.sessionId,
      fileName: uploadRes.data.fileName,
      fileType: uploadRes.data.fileType as 'pdf',
      textLength: uploadRes.data.textLength
    })

    store.setJobDescription(jobDescription.value.trim())
    store.setStatus('analyzing')

    const analyzeRes = await $fetch<AnalyzeResponse>('/api/analyze', {
      method: 'POST',
      body: {
        sessionId: uploadRes.data.sessionId,
        jobDescription: jobDescription.value.trim()
      }
    })

    if (!analyzeRes.success || !analyzeRes.data) {
      store.setError(toUiError(analyzeRes))
      return
    }

    store.setOriginalResumeText(uploadRes.data?.text || '')
    store.setAnalysis(analyzeRes.data)
    navigateTo('/results')
  } catch (error) {
    store.setError(toNetworkError(error))
  }
}
</script>
