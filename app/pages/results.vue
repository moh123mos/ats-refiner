<template>
  <div class="flex-1">
    <!-- Top Bar -->
    <div
      class="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30"
    >
      <div
        class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between"
      >
        <button
          class="flex items-center gap-2 text-sm text-slate-400 hover:text-green-400 transition-colors duration-200"
          @click="navigateTo('/')"
        >
          <UIcon
            name="i-lucide-arrow-left"
            class="w-4 h-4"
          />
          New Analysis
        </button>
        <h2 class="text-sm font-semibold text-slate-300 hidden sm:block">
          <span class="gradient-text">ATS Refiner</span> — Analysis Results
        </h2>
        <div class="text-xs text-slate-600">
          {{ store.fileName }}
        </div>
      </div>
    </div>

    <!-- No Analysis State -->
    <div
      v-if="!store.analysis"
      class="flex-1 flex items-center justify-center py-32"
    >
      <div class="text-center animate-fade-in-up">
        <div
          class="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4"
        >
          <UIcon
            name="i-lucide-file-search"
            class="w-10 h-10 text-slate-600"
          />
        </div>
        <h3 class="text-xl font-semibold text-slate-300 mb-2">
          No Analysis Available
        </h3>
        <p class="text-slate-500 mb-6">
          Upload your resume to get started
        </p>
        <UButton
          color="primary"
          @click="navigateTo('/')"
        >
          <UIcon
            name="i-lucide-upload"
            class="w-4 h-4 mr-2"
          />
          Upload Resume
        </UButton>
      </div>
    </div>

    <!-- Results Content -->
    <div
      v-else
      class="max-w-7xl mx-auto px-4 py-8"
    >
      <!-- Score + Keywords Row -->
      <div class="grid lg:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
        <!-- ATS Score Card -->
        <div
          class="glass rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-700/50"
        >
          <h3
            class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4"
          >
            ATS Score
          </h3>
          <div class="score-ring">
            <svg
              width="140"
              height="140"
              viewBox="0 0 140 140"
            >
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                stroke-width="10"
              />
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                :stroke="scoreColor"
                stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="
                  circumference
                    - circumference * (store.analysis.atsScore / 100)
                "
                style="
                  transition: stroke-dashoffset 1.5s
                    cubic-bezier(0.4, 0, 0.2, 1);
                "
              />
            </svg>
            <div
              class="score-value"
              :style="{ color: scoreColor }"
            >
              {{ store.analysis.atsScore }}
            </div>
          </div>
          <p class="text-xs text-slate-500 mt-2">
            out of 100
          </p>
          <p
            class="text-xs mt-2 px-3 py-1 rounded-full"
            :class="scoreLabel.class"
          >
            {{ scoreLabel.text }}
          </p>
        </div>

        <!-- Matched Keywords -->
        <div class="glass rounded-2xl p-6 border border-slate-700/50">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-2 h-2 rounded-full bg-green-400" />
            <h3
              class="text-xs font-semibold text-slate-400 uppercase tracking-widest"
            >
              Matched Keywords
            </h3>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="keyword in store.analysis.matchedKeywords"
              :key="keyword"
              class="px-2.5 py-1 text-xs font-medium rounded-lg bg-green-500/10 text-green-400 border border-green-500/20"
            >
              {{ keyword }}
            </span>
            <span
              v-if="!store.analysis.matchedKeywords.length"
              class="text-sm text-slate-500"
            >
              No matches found
            </span>
          </div>
        </div>

        <!-- Missing Keywords -->
        <div class="glass rounded-2xl p-6 border border-slate-700/50">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-2 h-2 rounded-full bg-amber-400" />
            <h3
              class="text-xs font-semibold text-slate-400 uppercase tracking-widest"
            >
              Missing Keywords
            </h3>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="keyword in store.analysis.missingKeywords"
              :key="keyword"
              class="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20"
            >
              {{ keyword }}
            </span>
            <span
              v-if="!store.analysis.missingKeywords.length"
              class="text-sm text-slate-500"
            >
              All keywords present!
            </span>
          </div>
        </div>
      </div>

      <!-- Suggestions + Warnings Row -->
      <div class="grid lg:grid-cols-2 gap-6 mb-8 animate-fade-in-up delay-200">
        <!-- Suggestions -->
        <div
          v-if="store.analysis.rewriteSuggestions.length"
          class="glass rounded-2xl p-6 border border-slate-700/50"
        >
          <div class="flex items-center gap-2 mb-4">
            <div
              class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"
            >
              <UIcon
                name="i-lucide-lightbulb"
                class="w-4 h-4 text-blue-400"
              />
            </div>
            <h3 class="text-sm font-semibold text-slate-300">
              Improvement Suggestions
            </h3>
          </div>
          <ul class="space-y-3">
            <li
              v-for="(suggestion, index) in store.analysis.rewriteSuggestions"
              :key="index"
              class="flex items-start gap-3 text-sm"
            >
              <span
                class="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
              >
                {{ index + 1 }}
              </span>
              <span class="text-slate-400">{{ suggestion }}</span>
            </li>
          </ul>
        </div>

        <!-- Warnings -->
        <div
          v-if="store.analysis.warnings.length"
          class="glass rounded-2xl p-6 border border-red-500/20"
        >
          <div class="flex items-center gap-2 mb-4">
            <div
              class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center"
            >
              <UIcon
                name="i-lucide-alert-triangle"
                class="w-4 h-4 text-red-400"
              />
            </div>
            <h3 class="text-sm font-semibold text-slate-300">
              Warnings
            </h3>
          </div>
          <ul class="space-y-2">
            <li
              v-for="(warning, index) in store.analysis.warnings"
              :key="index"
              class="flex items-start gap-2 text-sm text-red-400/80"
            >
              <UIcon
                name="i-lucide-alert-circle"
                class="w-4 h-4 flex-shrink-0 mt-0.5"
              />
              <span>{{ warning }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Original Resume Preview -->
      <div class="animate-fade-in-up delay-300">
        <div class="flex items-center gap-3 mb-5">
          <div
            class="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-file-text"
              class="w-5 h-5 text-slate-400"
            />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-200">
              Original Resume
            </h3>
            <p class="text-xs text-slate-500">
              The uploaded resume for reference
            </p>
          </div>
        </div>

        <div class="glass rounded-2xl p-6 border border-slate-700/50">
          <pre class="whitespace-pre-wrap text-sm text-slate-300 font-mono max-h-96 overflow-auto">{{ store.originalResumeText }}</pre>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'

const store = useSessionStore()

const circumference = 2 * Math.PI * 60

const scoreColor = computed(() => {
  const score = store.analysis?.atsScore ?? 0
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
})

const scoreLabel = computed(() => {
  const score = store.analysis?.atsScore ?? 0
  if (score >= 80)
    return { text: 'Excellent', class: 'bg-green-500/10 text-green-400' }
  if (score >= 60)
    return { text: 'Good', class: 'bg-amber-500/10 text-amber-400' }
  return { text: 'Needs Work', class: 'bg-red-500/10 text-red-400' }
})
</script>
