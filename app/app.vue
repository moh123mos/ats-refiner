<script setup lang="ts">
useHead({
  title: 'ATS Refiner — AI-Powered Resume Optimizer',
  meta: [
    { name: 'description', content: 'Optimize your resume for ATS systems with AI-powered analysis, structured templates, and instant downloads.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' }
  ]
})

useSeoMeta({
  title: 'ATS Refiner — AI-Powered Resume Optimizer',
  description: 'Optimize your resume for ATS systems with AI-powered analysis, structured templates, and instant downloads.',
  ogTitle: 'ATS Refiner — AI-Powered Resume Optimizer',
  ogDescription: 'Optimize your resume for ATS systems with AI-powered analysis, structured templates, and instant downloads.'
})
</script>

<template>
  <UApp>
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <NuxtPage />
      <AppFooter />
    </div>
  </UApp>
</template>
