<template>
  <div
    id="resume-content"
    class="resume-template bg-white max-w-[210mm] mx-auto shadow-lg"
  >
    <!-- Header with dark background -->
    <div class="bg-slate-900 px-8 py-7 text-white">
      <h1 class="text-2xl font-bold tracking-wide uppercase">
        {{ resume.contact.fullName || 'Your Name' }}
      </h1>
      <div class="w-16 h-1 bg-amber-500 mt-2 mb-3" />
      <div class="flex items-center flex-wrap gap-x-5 gap-y-1 text-xs text-slate-300">
        <span v-if="resume.contact.email">{{ resume.contact.email }}</span>
        <span v-if="resume.contact.phone">{{ resume.contact.phone }}</span>
        <span v-if="resume.contact.location">{{ resume.contact.location }}</span>
        <span v-if="resume.contact.linkedin">{{ resume.contact.linkedin }}</span>
        <span v-if="resume.contact.website">{{ resume.contact.website }}</span>
      </div>
    </div>

    <div class="p-8">
      <!-- Summary -->
      <section
        v-if="resume.summary"
        class="mb-6 bg-slate-50 border-l-4 border-amber-500 p-4"
      >
        <p class="text-sm text-slate-700 leading-relaxed">
          {{ resume.summary }}
        </p>
      </section>

      <!-- Experience -->
      <section
        v-if="resume.experience.length"
        class="mb-6"
      >
        <h2 class="text-sm font-bold text-slate-900 uppercase tracking-widest pb-2 mb-4 border-b-2 border-slate-900 flex items-center gap-2">
          <span class="w-2 h-2 bg-amber-500" />
          Professional Experience
        </h2>
        <div
          v-for="(exp, i) in resume.experience"
          :key="i"
          class="mb-5 last:mb-0"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-sm font-bold text-slate-900 uppercase">
                {{ exp.title }}
              </h3>
              <p class="text-sm font-medium text-amber-700">
                {{ exp.company }}<span
                  v-if="exp.location"
                  class="text-slate-500 font-normal"
                > | {{ exp.location }}</span>
              </p>
            </div>
            <span class="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 whitespace-nowrap">{{ exp.startDate }} – {{ exp.endDate }}</span>
          </div>
          <ul class="mt-2 space-y-1.5">
            <li
              v-for="(bullet, j) in exp.bullets"
              :key="j"
              class="text-sm text-slate-600 flex items-start gap-2"
            >
              <span class="w-1 h-1 bg-amber-500 mt-2 flex-shrink-0" />
              <span>{{ bullet }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Two columns -->
      <div class="grid grid-cols-3 gap-6">
        <!-- Left column (2/3) -->
        <div class="col-span-2 space-y-6">
          <!-- Projects -->
          <section v-if="resume.projects.length">
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-widest pb-2 mb-3 border-b-2 border-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 bg-amber-500" />
              Key Projects
            </h2>
            <div
              v-for="(proj, i) in resume.projects"
              :key="i"
              class="mb-3 last:mb-0"
            >
              <h3 class="text-sm font-bold text-slate-800">
                {{ proj.name }}
              </h3>
              <p
                v-if="proj.technologies.length"
                class="text-xs text-amber-600 mb-1"
              >
                {{ proj.technologies.join(' | ') }}
              </p>
              <p
                v-if="proj.description"
                class="text-sm text-slate-600"
              >
                {{ proj.description }}
              </p>
              <ul
                v-if="proj.bullets.length"
                class="mt-1 space-y-0.5"
              >
                <li
                  v-for="(b, j) in proj.bullets"
                  :key="j"
                  class="text-sm text-slate-600 flex items-start gap-2"
                >
                  <span class="w-1 h-1 bg-amber-500 mt-2 flex-shrink-0" />
                  <span>{{ b }}</span>
                </li>
              </ul>
            </div>
          </section>
        </div>

        <!-- Right column (1/3) -->
        <div class="space-y-6">
          <!-- Education -->
          <section v-if="resume.education.length">
            <h2 class="text-xs font-bold text-slate-900 uppercase tracking-widest pb-2 mb-3 border-b-2 border-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 bg-amber-500" />
              Education
            </h2>
            <div
              v-for="(edu, i) in resume.education"
              :key="i"
              class="mb-3 last:mb-0"
            >
              <h3 class="text-sm font-bold text-slate-800">
                {{ edu.degree }}
              </h3>
              <p class="text-xs text-slate-600">
                {{ edu.institution }}
              </p>
              <p class="text-xs text-slate-400">
                {{ edu.graduationDate }}
              </p>
            </div>
          </section>

          <!-- Skills -->
          <section v-if="resume.skills.length">
            <h2 class="text-xs font-bold text-slate-900 uppercase tracking-widest pb-2 mb-3 border-b-2 border-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 bg-amber-500" />
              Core Skills
            </h2>
            <div class="space-y-1">
              <div
                v-for="skill in resume.skills"
                :key="skill"
                class="text-xs text-slate-600 flex items-center gap-2"
              >
                <span class="w-1 h-1 bg-amber-500 flex-shrink-0" />
                {{ skill }}
              </div>
            </div>
          </section>

          <!-- Certifications -->
          <section v-if="resume.certifications.length">
            <h2 class="text-xs font-bold text-slate-900 uppercase tracking-widest pb-2 mb-3 border-b-2 border-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 bg-amber-500" />
              Certifications
            </h2>
            <div
              v-for="(cert, i) in resume.certifications"
              :key="i"
              class="mb-2 last:mb-0"
            >
              <p class="text-xs font-medium text-slate-700">
                {{ cert.name }}
              </p>
              <p class="text-xs text-slate-400">
                {{ cert.issuer }} · {{ cert.date }}
              </p>
            </div>
          </section>

          <!-- Languages -->
          <section v-if="resume.languages.length">
            <h2 class="text-xs font-bold text-slate-900 uppercase tracking-widest pb-2 mb-3 border-b-2 border-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 bg-amber-500" />
              Languages
            </h2>
            <div class="space-y-1">
              <p
                v-for="lang in resume.languages"
                :key="lang"
                class="text-xs text-slate-600"
              >
                {{ lang }}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StructuredResume } from '~/types'

defineProps<{
  resume: StructuredResume
}>()
</script>
