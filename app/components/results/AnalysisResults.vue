<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">
        Analysis Results
      </h2>
      <UButton
        color="primary"
        @click="downloadImproved"
      >
        <UIcon
          name="i-lucide-download"
          class="w-4 h-4 mr-2"
        />
        Download
      </UButton>
    </div>

    <div
      v-if="!store.analysis"
      class="text-center py-12"
    >
      <p class="text-gray-500">
        No analysis available
      </p>
      <UButton
        class="mt-4"
        @click="navigateTo('/')"
      >
        Upload Resume
      </UButton>
    </div>

    <template v-else>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h3 class="text-lg font-semibold mb-4">
            ATS Score
          </h3>
          <div class="flex items-center justify-center">
            <div
              class="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold"
              :class="scoreColorClass"
            >
              {{ store.analysis.atsScore }}
            </div>
          </div>
          <p class="text-center text-sm text-gray-500 mt-2">
            out of 100
          </p>
        </div>

        <div class="space-y-4">
          <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 class="font-medium text-green-700 dark:text-green-400 mb-2">
              Matched Keywords
            </h4>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="keyword in store.analysis.matchedKeywords"
                :key="keyword"
                color="success"
              >
                {{ keyword }}
              </UBadge>
              <span
                v-if="!store.analysis.matchedKeywords.length"
                class="text-gray-500"
              >
                None found
              </span>
            </div>
          </div>

          <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <h4 class="font-medium text-amber-700 dark:text-amber-400 mb-2">
              Missing Keywords
            </h4>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="keyword in store.analysis.missingKeywords"
                :key="keyword"
                color="warning"
              >
                {{ keyword }}
              </UBadge>
              <span
                v-if="!store.analysis.missingKeywords.length"
                class="text-gray-500"
              >
                None found
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="store.analysis.rewriteSuggestions.length"
        class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
      >
        <h4 class="font-medium text-blue-700 dark:text-blue-400 mb-2">
          Suggestions
        </h4>
        <ul class="space-y-2">
          <li
            v-for="(suggestion, index) in store.analysis.rewriteSuggestions"
            :key="index"
            class="flex items-start gap-2"
          >
            <UIcon
              name="i-lucide-arrow-right"
              class="w-4 h-4 mt-1 text-blue-500 flex-shrink-0"
            />
            <span>{{ suggestion }}</span>
          </li>
        </ul>
      </div>

      <div
        v-if="store.analysis.warnings.length"
        class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
      >
        <h4 class="font-medium text-red-700 dark:text-red-400 mb-2">
          Warnings
        </h4>
        <ul class="space-y-1">
          <li
            v-for="(warning, index) in store.analysis.warnings"
            :key="index"
            class="text-red-600 dark:text-red-400"
          >
            {{ warning }}
          </li>
        </ul>
      </div>

      <div class="space-y-2">
        <h4 class="text-lg font-semibold">
          Improved Resume
        </h4>
        <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-96 overflow-auto">
          <pre class="whitespace-pre-wrap text-sm">{{ store.analysis.improvedResumeText }}</pre>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'

const store = useSessionStore()

const scoreColorClass = computed(() => {
  const score = store.analysis?.atsScore ?? 0
  if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (score >= 60) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
})

async function downloadImproved() {
  if (!store.sessionId || !store.analysis) return

  try {
    const response = await $fetch<{
      success: boolean
      data: { fileName: string, content: string, mimeType: string } | null
    }>(`/api/download/${store.sessionId}`)

    if (!response.success || !response.data) {
      throw new Error('Download failed')
    }

    const blob = new Blob([response.data.content], { type: response.data.mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = response.data.fileName
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
  }
}
</script>
