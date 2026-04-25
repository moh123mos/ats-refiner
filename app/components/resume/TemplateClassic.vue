<template>
  <div
    id="resume-content"
    class="resume-template bg-white p-8 max-w-[210mm] mx-auto shadow-lg rounded-xl"
  >
    <!-- Header -->
    <div class="text-center border-b-2 border-slate-800 pb-4 mb-5">
      <h1 class="text-3xl font-bold text-slate-900 tracking-wide uppercase">
        {{ resume.contact.fullName || "Your Name" }}
      </h1>
      <div
        class="flex items-center justify-center flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-600"
      >
        <span
          v-if="resume.contact.email"
          class="flex items-center gap-1"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {{ resume.contact.email }}
        </span>
        <span
          v-if="resume.contact.phone"
          class="flex items-center gap-1"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          {{ resume.contact.phone }}
        </span>
        <span
          v-if="resume.contact.location"
          class="flex items-center gap-1"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {{ resume.contact.location }}
        </span>
        <span
          v-if="resume.contact.linkedin"
          class="flex items-center gap-1"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            />
          </svg>
          {{ resume.contact.linkedin }}
        </span>
      </div>
    </div>

    <!-- Summary -->
    <section
      v-if="resume.summary"
      class="mb-5"
    >
      <h2
        class="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2"
      >
        Professional Summary
      </h2>
      <p class="text-sm text-slate-700 leading-relaxed">
        {{ resume.summary }}
      </p>
    </section>

    <!-- Experience -->
    <section
      v-if="resume.experience.length"
      class="mb-5"
    >
      <h2
        class="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3"
      >
        Professional Experience
      </h2>
      <div
        v-for="(exp, i) in resume.experience"
        :key="i"
        class="mb-4 last:mb-0"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-sm font-bold text-slate-800">
              {{ exp.title }}
            </h3>
            <p class="text-sm text-slate-600 italic">
              {{ exp.company
              }}<span v-if="exp.location"> — {{ exp.location }}</span>
            </p>
          </div>
          <span class="text-xs text-slate-500 whitespace-nowrap">{{ exp.startDate }} – {{ exp.endDate }}</span>
        </div>
        <ul class="mt-1.5 space-y-1">
          <li
            v-for="(bullet, j) in exp.bullets"
            :key="j"
            class="text-sm text-slate-700 flex items-start gap-2"
          >
            <span class="text-slate-400 mt-1.5 text-[6px]">●</span>
            <span>{{ bullet }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- Education -->
    <section
      v-if="resume.education.length"
      class="mb-5"
    >
      <h2
        class="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3"
      >
        Education
      </h2>
      <div
        v-for="(edu, i) in resume.education"
        :key="i"
        class="mb-3 last:mb-0"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-sm font-bold text-slate-800">
              {{ edu.degree }}
            </h3>
            <p class="text-sm text-slate-600 italic">
              {{ edu.institution
              }}<span v-if="edu.location"> — {{ edu.location }}</span>
            </p>
          </div>
          <span class="text-xs text-slate-500 whitespace-nowrap">{{
            edu.graduationDate
          }}</span>
        </div>
        <p
          v-if="edu.gpa"
          class="text-xs text-slate-500 mt-0.5"
        >
          GPA: {{ edu.gpa }}
        </p>
      </div>
    </section>

    <!-- Skills -->
    <section
      v-if="resume.skills.length"
      class="mb-5"
    >
      <h2
        class="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2"
      >
        Technical Skills
      </h2>
      <p class="text-sm text-slate-700">
        {{ resume.skills.join(" • ") }}
      </p>
    </section>

    <!-- Projects -->
    <section
      v-if="resume.projects.length"
      class="mb-5"
    >
      <h2
        class="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3"
      >
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
            class="font-normal text-slate-500"
          >
            | {{ proj.technologies.join(", ") }}</span>
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
            class="text-sm text-slate-700 flex items-start gap-2"
          >
            <span class="text-slate-400 mt-1.5 text-[6px]">●</span>
            <span>{{ b }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- Certifications -->
    <section
      v-if="resume.certifications.length"
      class="mb-5"
    >
      <h2
        class="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2"
      >
        Certifications
      </h2>
      <div
        v-for="(cert, i) in resume.certifications"
        :key="i"
        class="flex justify-between text-sm mb-1"
      >
        <span class="text-slate-700"><strong>{{ cert.name }}</strong> — {{ cert.issuer }}</span>
        <span class="text-slate-500 text-xs">{{ cert.date }}</span>
      </div>
    </section>

    <!-- Languages -->
    <section v-if="resume.languages.length">
      <h2
        class="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2"
      >
        Languages
      </h2>
      <p class="text-sm text-slate-700">
        {{ resume.languages.join(" • ") }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { StructuredResume } from '~/types'

defineProps<{
  resume: StructuredResume
}>()
</script>
