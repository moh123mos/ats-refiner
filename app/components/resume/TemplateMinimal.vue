<template>
  <div
    id="resume-content"
    class="resume-template bg-white max-w-[210mm] mx-auto shadow-lg p-10"
  >
    <!-- Header - Clean and minimal -->
    <div class="mb-8">
      <h1 class="text-4xl font-light text-slate-800 tracking-tight">
        {{ resume.contact.fullName || 'Your Name' }}
      </h1>
      <div class="w-12 h-0.5 bg-slate-800 mt-3 mb-3" />
      <div class="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
        <span v-if="resume.contact.email">{{ resume.contact.email }}</span>
        <span
          v-if="resume.contact.email && resume.contact.phone"
          class="text-slate-300"
        >|</span>
        <span v-if="resume.contact.phone">{{ resume.contact.phone }}</span>
        <span
          v-if="resume.contact.phone && resume.contact.location"
          class="text-slate-300"
        >|</span>
        <span v-if="resume.contact.location">{{ resume.contact.location }}</span>
        <span
          v-if="resume.contact.location && resume.contact.linkedin"
          class="text-slate-300"
        >|</span>
        <span v-if="resume.contact.linkedin">{{ resume.contact.linkedin }}</span>
      </div>
    </div>

    <!-- Summary -->
    <section
      v-if="resume.summary"
      class="mb-7"
    >
      <p class="text-sm text-slate-600 leading-relaxed italic">
        {{ resume.summary }}
      </p>
    </section>

    <!-- Experience -->
    <section
      v-if="resume.experience.length"
      class="mb-7"
    >
      <h2 class="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.25em] mb-4">
        Experience
      </h2>
      <div
        v-for="(exp, i) in resume.experience"
        :key="i"
        class="mb-5 last:mb-0"
      >
        <div class="flex justify-between items-baseline">
          <h3 class="text-sm font-semibold text-slate-800">
            {{ exp.title }}
          </h3>
          <span class="text-xs text-slate-400">{{ exp.startDate }} — {{ exp.endDate }}</span>
        </div>
        <p class="text-xs text-slate-500 mb-1.5">
          {{ exp.company }}<span v-if="exp.location"> · {{ exp.location }}</span>
        </p>
        <ul class="space-y-1">
          <li
            v-for="(bullet, j) in exp.bullets"
            :key="j"
            class="text-sm text-slate-600 pl-3 relative before:content-['–'] before:absolute before:left-0 before:text-slate-300"
          >
            {{ bullet }}
          </li>
        </ul>
      </div>
    </section>

    <!-- Education -->
    <section
      v-if="resume.education.length"
      class="mb-7"
    >
      <h2 class="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.25em] mb-4">
        Education
      </h2>
      <div
        v-for="(edu, i) in resume.education"
        :key="i"
        class="mb-3 last:mb-0 flex justify-between items-baseline"
      >
        <div>
          <h3 class="text-sm font-semibold text-slate-800">
            {{ edu.degree }}
          </h3>
          <p class="text-xs text-slate-500">
            {{ edu.institution }}<span v-if="edu.gpa"> · {{ edu.gpa }}</span>
          </p>
        </div>
        <span class="text-xs text-slate-400">{{ edu.graduationDate }}</span>
      </div>
    </section>

    <!-- Skills -->
    <section
      v-if="resume.skills.length"
      class="mb-7"
    >
      <h2 class="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.25em] mb-3">
        Skills
      </h2>
      <p class="text-sm text-slate-600">
        {{ resume.skills.join('  ·  ') }}
      </p>
    </section>

    <!-- Projects -->
    <section
      v-if="resume.projects.length"
      class="mb-7"
    >
      <h2 class="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.25em] mb-4">
        Projects
      </h2>
      <div
        v-for="(proj, i) in resume.projects"
        :key="i"
        class="mb-3 last:mb-0"
      >
        <h3 class="text-sm font-semibold text-slate-800">
          {{ proj.name }}
          <span
            v-if="proj.technologies.length"
            class="font-normal text-xs text-slate-400"
          > · {{ proj.technologies.join(', ') }}</span>
        </h3>
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
            class="text-sm text-slate-600 pl-3 relative before:content-['–'] before:absolute before:left-0 before:text-slate-300"
          >
            {{ b }}
          </li>
        </ul>
      </div>
    </section>

    <!-- Certifications & Languages -->
    <div
      v-if="resume.certifications.length || resume.languages.length"
      class="flex gap-12"
    >
      <section
        v-if="resume.certifications.length"
        class="flex-1"
      >
        <h2 class="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.25em] mb-2">
          Certifications
        </h2>
        <div
          v-for="(cert, i) in resume.certifications"
          :key="i"
          class="text-sm text-slate-600 mb-1"
        >
          {{ cert.name }} <span class="text-slate-400">· {{ cert.issuer }}</span>
        </div>
      </section>
      <section
        v-if="resume.languages.length"
        class="flex-1"
      >
        <h2 class="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.25em] mb-2">
          Languages
        </h2>
        <p class="text-sm text-slate-600">
          {{ resume.languages.join('  ·  ') }}
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StructuredResume } from '~/types'

defineProps<{
  resume: StructuredResume
}>()
</script>
