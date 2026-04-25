import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AnalysisResult, StructuredResume } from '@/types'

const apiKey = process.env.GEMINI_API_KEY || process.env.NUXT_GEMINI_API_KEY || ''

let genAI: GoogleGenerativeAI | null = null
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey)
  console.log('[AI] Gemini initialized successfully')
} else {
  console.log('[AI] No API key found - using mock analysis')
}

export interface AIAnalysisInput {
  resumeText: string
  jobDescription: string
}

export async function analyzeWithAI(
  input: AIAnalysisInput
): Promise<AnalysisResult> {
  if (!genAI) {
    return getMockAnalysis(input)
  }

  const prompt = buildPrompt(input)

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return parseAIResponse(text, input)
  } catch (error) {
    console.error('AI analysis failed:', error)
    return getMockAnalysis(input)
  }
}

function buildPrompt(input: AIAnalysisInput): string {
  return `# ATS Resume Analysis & Improvement Suggestions

You are an expert ATS (Applicant Tracking System) analyst. Your task is to analyze the resume, identify gaps, and provide actionable improvement suggestions. Do NOT create an improved version of the resume - focus on analysis and recommendations only.

## Resume Text:
${input.resumeText}

## Job Description:
${input.jobDescription}

## Output Format (JSON only, no markdown fences, no explanations):
{
  "atsScore": <number 0-100>,
  "matchedKeywords": [<array of matched keyword strings>],
  "missingKeywords": [<array of missing keyword strings>],
  "rewriteSuggestions": [
    "<specific, actionable suggestion 1 based on actual resume content>",
    "<specific, actionable suggestion 2 based on actual resume content>",
    "<specific, actionable suggestion 3 based on actual resume content>"
  ],
  "improvedResumeText": "<keep original resume text with minimal improvements - add missing keywords naturally if possible, otherwise keep original>",
  "structuredResume": {
    "contact": {
      "fullName": "<extract from resume>",
      "email": "<extract from resume>",
      "phone": "<extract from resume>",
      "location": "<extract from resume>",
      "linkedin": "<extract if available>",
      "website": "<extract if available>"
    },
    "summary": "<extract or keep original>",
    "experience": [<extract from resume>],
    "education": [<extract from resume>],
    "skills": [<extract from resume>],
    "projects": [<extract if available>],
    "certifications": [<extract if available>],
    "languages": [<extract if available>]
  },
  "warnings": [<array of warning strings about format issues, length, missing sections, etc>]
}

CRITICAL RULES:
1. Focus on QUALITY of analysis - each suggestion must reference SPECIFIC sections/content from the resume
2. Provide ACCURATE atsScore based on keyword matching and content quality
3. Match keywords EXACTLY - only match if the keyword word/phrase exists in both JD and resume
4. Keep all arrays populated - use empty arrays [] if no data exists
5. Provide ONLY valid JSON, no explanations or markdown fences`
}

function parseAIResponse(text: string, input: AIAnalysisInput): AnalysisResult {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return getMockAnalysis(input)
    }

    const parsed = JSON.parse(jsonMatch[0])

    const structuredResume: StructuredResume = {
      contact: {
        fullName: parsed.structuredResume?.contact?.fullName || '',
        email: parsed.structuredResume?.contact?.email || '',
        phone: parsed.structuredResume?.contact?.phone || '',
        location: parsed.structuredResume?.contact?.location || '',
        linkedin: parsed.structuredResume?.contact?.linkedin || '',
        website: parsed.structuredResume?.contact?.website || ''
      },
      summary: parsed.structuredResume?.summary || '',
      experience: Array.isArray(parsed.structuredResume?.experience)
        ? parsed.structuredResume.experience.map(
            (exp: Record<string, unknown>) => ({
              title: exp.title || '',
              company: exp.company || '',
              location: exp.location || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              bullets: Array.isArray(exp.bullets) ? exp.bullets : []
            })
          )
        : [],
      education: Array.isArray(parsed.structuredResume?.education)
        ? parsed.structuredResume.education.map(
            (edu: Record<string, unknown>) => ({
              degree: edu.degree || '',
              institution: edu.institution || '',
              location: edu.location || '',
              graduationDate: edu.graduationDate || '',
              gpa: edu.gpa || ''
            })
          )
        : [],
      skills: Array.isArray(parsed.structuredResume?.skills)
        ? parsed.structuredResume.skills
        : [],
      projects: Array.isArray(parsed.structuredResume?.projects)
        ? parsed.structuredResume.projects.map(
            (proj: Record<string, unknown>) => ({
              name: proj.name || '',
              description: proj.description || '',
              technologies: Array.isArray(proj.technologies)
                ? proj.technologies
                : [],
              bullets: Array.isArray(proj.bullets) ? proj.bullets : []
            })
          )
        : [],
      certifications: Array.isArray(parsed.structuredResume?.certifications)
        ? parsed.structuredResume.certifications.map(
            (cert: Record<string, unknown>) => ({
              name: cert.name || '',
              issuer: cert.issuer || '',
              date: cert.date || ''
            })
          )
        : [],
      languages: Array.isArray(parsed.structuredResume?.languages)
        ? parsed.structuredResume.languages
        : []
    }

    return {
      atsScore: Math.min(100, Math.max(0, Number(parsed.atsScore) || 50)),
      matchedKeywords: Array.isArray(parsed.matchedKeywords)
        ? parsed.matchedKeywords
        : [],
      missingKeywords: Array.isArray(parsed.missingKeywords)
        ? parsed.missingKeywords
        : [],
      rewriteSuggestions: Array.isArray(parsed.rewriteSuggestions)
        ? parsed.rewriteSuggestions
        : [],
      improvedResumeText:
        typeof parsed.improvedResumeText === 'string'
          ? parsed.improvedResumeText
          : '',
      structuredResume,
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : []
    }
  } catch {
    return getMockAnalysis(input)
  }
}

function extractFromResume(text: string): StructuredResume {
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean)

  // Extract email
  const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w{2,}/)
  const email = emailMatch ? emailMatch[0] : ''

  // Extract phone
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,}\d)/)
  const phone = phoneMatch?.[1]?.trim() ?? ''

  // Extract LinkedIn
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/[\w-]+|linkedin\.com\/[\w-]+)/i)
  const linkedin = linkedinMatch?.[0] ?? ''

  // Extract website (non-linkedin URL)
  const urlMatch = text.match(/(?:https?:\/\/)?(?!.*linkedin)[\w-]+\.[\w.-]+(?:\/[\w.-]*)*(?!.*@)/i)
  const website = urlMatch && !urlMatch[0].includes('@') ? urlMatch[0] : ''

  // Name is usually the first meaningful line (not email/phone/url)
  let fullName = ''
  for (const line of lines.slice(0, 5)) {
    const clean = line.replace(/[|•·,]/g, '').trim()
    if (
      clean.length > 2
      && clean.length < 50
      && !clean.includes('@')
      && !clean.match(/^\+?\d/)
      && !clean.match(/https?:\/\//)
      && !clean.match(/linkedin/i)
      && !clean.match(/github/i)
    ) {
      fullName = clean
      break
    }
  }

  // Extract location (City, Country/State pattern)
  const locationMatch = text.match(/(?:^|\n|[|•·,])\s*([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+)/m)
  const location = locationMatch?.[1]?.trim() ?? ''

  // Extract skills - look for common tech terms
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Vue.js', 'Angular', 'Node.js', 'Node',
    'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Linux',
    'Git', 'GitHub', 'CI/CD', 'Jenkins', 'REST', 'GraphQL',
    'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap',
    'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Next.js', 'Nuxt',
    'Figma', 'Photoshop', 'Illustrator',
    'Agile', 'Scrum', 'Jira', 'Trello'
  ]
  const foundSkills = commonSkills.filter(s =>
    text.toLowerCase().includes(s.toLowerCase())
  )

  // Parse sections by common headings
  const sectionRegex = /(?:^|\n)\s*(experience|education|projects?|certifications?|languages?|skills?|summary|profile|about|objective)\s*[:\n]/gi
  const sections: Record<string, string> = {}
  let match
  const sectionPositions: { name: string, start: number }[] = []
  while ((match = sectionRegex.exec(text)) !== null) {
    const matchName = match[1]
    if (matchName) {
      sectionPositions.push({ name: matchName.toLowerCase(), start: match.index + match[0].length })
    }
  }
  for (let i = 0; i < sectionPositions.length; i++) {
    const currentSection = sectionPositions[i]
    if (!currentSection) continue
    const end = i + 1 < sectionPositions.length ? sectionPositions[i + 1]?.start : text.length
    sections[currentSection.name] = text.slice(currentSection.start, end).trim()
  }

  // Parse experience blocks
  const experience: StructuredResume['experience'] = []
  const expText = sections['experience'] || ''
  if (expText) {
    // Split by date patterns or company-title patterns
    const expLines = expText.split(/\n/).map(l => l.trim()).filter(Boolean)
    let current: { title: string, company: string, location: string, startDate: string, endDate: string, bullets: string[] } | null = null

    for (const line of expLines) {
      // Check if line looks like a job title or company (usually short, no bullet)
      const dateMatch = line.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s*\d{0,4}\s*[-–—to]+\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|Present|Current)?\s*\d{0,4}|\d{4}\s*[-–—to]+\s*(?:\d{4}|Present|Current))/i)

      if (dateMatch && line.length < 100 && !line.startsWith('-') && !line.startsWith('•')) {
        if (current) experience.push(current)
        const dateStr = dateMatch[1] ?? ''
        const dateParts = dateStr.split(/[-–—]|to/i).map((d: string) => d.trim())
        current = {
          title: line.replace(dateMatch[0], '').replace(/[|•·,]/g, ' ').trim(),
          company: '',
          location: '',
          startDate: dateParts[0] ?? '',
          endDate: dateParts[1] ?? '',
          bullets: []
        }
      } else if (current && (line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))) {
        current.bullets.push(line.replace(/^[-•*]\s*/, ''))
      } else if (current && current.title && !current.company && line.length < 80) {
        current.company = line.replace(/[|•·]/g, ' ').trim()
      }
    }
    if (current) experience.push(current)
  }

  // Parse education
  const education: StructuredResume['education'] = []
  const eduText = sections['education'] || ''
  if (eduText) {
    const eduLines = eduText.split(/\n/).map(l => l.trim()).filter(Boolean)
    for (const line of eduLines) {
      if (line.length > 10 && (line.match(/bachelor|master|b\.?s\.?|m\.?s\.?|ph\.?d|diploma|degree/i) || line.match(/university|college|institute|school/i))) {
        education.push({
          degree: line.replace(/\d{4}.*/, '').trim(),
          institution: '',
          location: '',
          graduationDate: (line.match(/\d{4}/) ?? [''])[0] ?? '',
          gpa: (line.match(/(?:GPA|gpa|G\.P\.A\.?)\s*:?\s*([\d.]+)/) ?? ['', ''])[1] ?? ''
        })
      }
    }
  }

  // Build summary from profile/summary section or first paragraph
  let summary = sections['summary'] || sections['profile'] || sections['about'] || sections['objective'] || ''
  if (!summary && lines.length > 3) {
    // Use first paragraph-like content after the header
    const headerEnd = Math.min(5, lines.length)
    for (let i = headerEnd; i < Math.min(headerEnd + 5, lines.length); i++) {
      const line = lines[i]
      if (line && line.length > 60) {
        summary = line
        break
      }
    }
  }

  return {
    contact: { fullName, email, phone, location, linkedin, website },
    summary: summary.slice(0, 500),
    experience,
    education,
    skills: foundSkills,
    projects: [],
    certifications: [],
    languages: []
  }
}

function getMockAnalysis(input: AIAnalysisInput): AnalysisResult {
  const jdLower = input.jobDescription.toLowerCase()
  const resumeLower = input.resumeText.toLowerCase()

  const keywords = [
    'javascript',
    'typescript',
    'react',
    'vue',
    'node',
    'python',
    'sql',
    'aws',
    'docker',
    'kubernetes',
    'git',
    'api',
    'rest',
    'agile',
    'scrum',
    'ci/cd',
    'linux'
  ]

  const matched = keywords.filter(
    kw => jdLower.includes(kw) && resumeLower.includes(kw)
  )
  const missing = keywords.filter(
    kw => jdLower.includes(kw) && !resumeLower.includes(kw)
  )

  // Extract real data from the uploaded resume text
  const structuredResume = extractFromResume(input.resumeText)

  return {
    atsScore: Math.min(100, 50 + matched.length * 5),
    matchedKeywords: matched.slice(0, 8),
    missingKeywords: missing.slice(0, 8),
    rewriteSuggestions: [
      'Add more quantifiable achievements',
      'Include relevant technical skills mentioned in JD',
      'Use action verbs to describe accomplishments',
      'Tailor summary section to the role'
    ],
    improvedResumeText: input.resumeText,
    structuredResume,
    warnings: [
      'AI analysis unavailable — using basic text extraction. Results may be incomplete.'
    ]
  }
}
