<template>
  <div
    id="resume-content"
    class="resume-template bg-white max-w-[210mm] mx-auto shadow-lg"
  >
    <div class="grid grid-cols-[240px_1fr]">
      <!-- Left Sidebar -->
      <div class="bg-gradient-to-b from-indigo-900 to-indigo-800 text-white p-6">
        <!-- Name -->
        <div class="mb-6">
          <h1 class="text-xl font-bold leading-tight">
            {{ resume.contact.fullName || 'Your Name' }}
          </h1>
          <div class="w-8 h-0.5 bg-indigo-400 mt-2" />
        </div>

        <!-- Contact -->
        <div class="space-y-2.5 mb-6">
          <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300 mb-2">
            Contact
          </h2>
          <div
            v-if="resume.contact.email"
            class="flex items-start gap-2 text-xs text-indigo-100"
          >
            <svg
              class="w-3 h-3 mt-0.5 flex-shrink-0 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            /></svg>
            <span class="break-all">{{ resume.contact.email }}</span>
          </div>
          <div
            v-if="resume.contact.phone"
            class="flex items-start gap-2 text-xs text-indigo-100"
          >
            <svg
              class="w-3 h-3 mt-0.5 flex-shrink-0 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            /></svg>
            <span>{{ resume.contact.phone }}</span>
          </div>
          <div
            v-if="resume.contact.location"
            class="flex items-start gap-2 text-xs text-indigo-100"
          >
            <svg
              class="w-3 h-3 mt-0.5 flex-shrink-0 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            /></svg>
            <span>{{ resume.contact.location }}</span>
          </div>
          <div
            v-if="resume.contact.linkedin"
            class="flex items-start gap-2 text-xs text-indigo-100"
          >
            <svg
              class="w-3 h-3 mt-0.5 flex-shrink-0 text-indigo-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            ><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            <span class="break-all">{{ resume.contact.linkedin }}</span>
          </div>
        </div>

        <!-- Skills -->
        <div
          v-if="resume.skills.length"
          class="mb-6"
        >
          <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300 mb-3">
            Skills
          </h2>
          <div class="space-y-1.5">
            <div
              v-for="skill in resume.skills"
              :key="skill"
              class="text-xs text-indigo-100 flex items-center gap-2"
            >
              <span class="w-1 h-1 bg-indigo-400 rounded-full flex-shrink-0" />
              {{ skill }}
            </div>
          </div>
        </div>

        <!-- Languages -->
        <div
          v-if="resume.languages.length"
          class="mb-6"
        >
          <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300 mb-3">
            Languages
          </h2>
          <div class="space-y-1">
            <p
              v-for="lang in resume.languages"
              :key="lang"
              class="text-xs text-indigo-100"
            >
              {{ lang }}
            </p>
          </div>
        </div>

        <!-- Certifications -->
        <div v-if="resume.certifications.length">
          <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300 mb-3">
            Certifications
          </h2>
          <div
            v-for="(cert, i) in resume.certifications"
            :key="i"
            class="mb-2 last:mb-0"
          >
            <p class="text-xs font-medium text-white">
              {{ cert.name }}
            </p>
            <p class="text-[10px] text-indigo-300">
              {{ cert.issuer }} · {{ cert.date }}
            </p>
          </div>
        </div>
      </div>

      <!-- Right Content -->
      <div class="p-7">
        <!-- Summary -->
        <section
          v-if="resume.summary"
          class="mb-6"
        >
          <h2 class="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span class="w-4 h-0.5 bg-indigo-500" />
            About Me
          </h2>
          <p class="text-sm text-slate-600 leading-relaxed">
            {{ resume.summary }}
          </p>
        </section>

        <!-- Experience -->
        <section
          v-if="resume.experience.length"
          class="mb-6"
        >
          <h2 class="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span class="w-4 h-0.5 bg-indigo-500" />
            Experience
          </h2>
          <div
            v-for="(exp, i) in resume.experience"
            :key="i"
            class="mb-5 last:mb-0 relative pl-4 border-l border-indigo-200"
          >
            <div class="absolute left-[-3.5px] top-1 w-[7px] h-[7px] rounded-full bg-indigo-500" />
            <div class="flex justify-between items-start flex-wrap gap-1">
              <div>
                <h3 class="text-sm font-bold text-slate-800">
                  {{ exp.title }}
                </h3>
                <p class="text-xs text-indigo-600 font-medium">
                  {{ exp.company }}<span
                    v-if="exp.location"
                    class="text-slate-400 font-normal"
                  > · {{ exp.location }}</span>
                </p>
              </div>
              <span class="text-[10px] text-slate-400">{{ exp.startDate }} – {{ exp.endDate }}</span>
            </div>
            <ul class="mt-1.5 space-y-1">
              <li
                v-for="(bullet, j) in exp.bullets"
                :key="j"
                class="text-xs text-slate-600 flex items-start gap-1.5"
              >
                <span class="text-indigo-400 mt-0.5">›</span>
                <span>{{ bullet }}</span>
              </li>
            </ul>
          </div>
        </section>

        <!-- Education -->
        <section
          v-if="resume.education.length"
          class="mb-6"
        >
          <h2 class="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span class="w-4 h-0.5 bg-indigo-500" />
            Education
          </h2>
          <div
            v-for="(edu, i) in resume.education"
            :key="i"
            class="mb-2 last:mb-0 flex justify-between items-start"
          >
            <div>
              <h3 class="text-sm font-bold text-slate-800">
                {{ edu.degree }}
              </h3>
              <p class="text-xs text-slate-500">
                {{ edu.institution }}<span v-if="edu.gpa"> · GPA: {{ edu.gpa }}</span>
              </p>
            </div>
            <span class="text-[10px] text-slate-400">{{ edu.graduationDate }}</span>
          </div>
        </section>

        <!-- Projects -->
        <section v-if="resume.projects.length">
          <h2 class="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span class="w-4 h-0.5 bg-indigo-500" />
            Projects
          </h2>
          <div
            v-for="(proj, i) in resume.projects"
            :key="i"
            class="mb-3 last:mb-0"
          >
            <h3 class="text-sm font-bold text-slate-800">
              {{ proj.name }}
              <span
                v-if="proj.technologies.length"
                class="font-normal text-indigo-500 text-[10px]"
              >{{ proj.technologies.join(' · ') }}</span>
            </h3>
            <p
              v-if="proj.description"
              class="text-xs text-slate-600"
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
                class="text-xs text-slate-600 flex items-start gap-1.5"
              >
                <span class="text-indigo-400 mt-0.5">›</span>
                <span>{{ b }}</span>
              </li>
            </ul>
          </div>
        </section>
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
