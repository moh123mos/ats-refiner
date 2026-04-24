<template>
  <div class="space-y-6">
    <div
      class="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200"
      :class="[
        isDragging
          ? 'border-primary-500 bg-primary-500/10'
          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <div class="space-y-4">
        <UIcon name="i-lucide-upload" class="w-12 h-12 mx-auto text-gray-400" />
        <div>
          <p class="text-lg font-medium text-gray-700 dark:text-gray-200">
            Drop your resume here
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            PDF or DOCX (max 10MB)
          </p>
        </div>
        <UButton variant="outline" @click="openFilePicker">
          Browse Files
        </UButton>
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,.docx"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>
    </div>

    <div
      v-if="selectedFile"
      class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      <UIcon name="i-lucide-file-text" class="w-8 h-8 text-primary-500" />
      <div class="flex-1 min-w-0">
        <p class="font-medium truncate">
          {{ selectedFile.name }}
        </p>
        <p class="text-sm text-gray-500">
          {{ formatSize(selectedFile.size) }}
        </p>
      </div>
      <UButton variant="ghost" color="error" @click="clearFile">
        <UIcon name="i-lucide-x" class="w-4 h-4" />
      </UButton>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Job Description
      </label>
      <UTextarea
        v-model="jobDescription"
        placeholder="Paste the job description here..."
        :disabled="store.status === 'analyzing'"
        :rows="10"
        :cols="800"
      />
    </div>

    <UButton
      color="primary"
      size="lg"
      block
      :loading="isProcessing"
      :disabled="!canSubmit"
      @click="submitAnalysis"
    >
      {{ submitButtonText }}
    </UButton>

    <div
      v-if="store.error"
      class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
    >
      <p class="font-medium text-red-700 dark:text-red-300">
        {{ store.error.message }}
      </p>
      <p
        v-if="store.error.hint"
        class="mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ store.error.hint }}
      </p>
      <p
        v-if="store.error.code || store.error.requestId"
        class="mt-2 text-xs text-red-500/90 dark:text-red-300/80"
      >
        <span v-if="store.error.code">Code: {{ store.error.code }}</span>
        <span v-if="store.error.code && store.error.requestId"> - </span>
        <span v-if="store.error.requestId"
          >Reference: {{ store.error.requestId }}</span
        >
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from "~/stores/session";
import type { AnalyzeResponse, ApiErrorDetails, UploadResponse } from "~/types";

interface UiError {
  message: string;
  code?: string;
  hint?: string;
  requestId?: string;
}

const ERROR_HINTS: Record<string, string> = {
  PARSE_ERROR:
    "We could not read this file format safely. Please re-export your resume and try again.",
  PDF_PASSWORD_PROTECTED: "Unlock the PDF first, then upload it again.",
  INVALID_PDF_CONTENT:
    "The PDF structure looks invalid. Re-export the file and retry.",
  EMPTY_CONTENT:
    "The file has little or no readable text. Use a text-based PDF or DOCX.",
  INVALID_MIME:
    "The file MIME type is not supported. Upload a valid PDF or DOCX.",
  UNSUPPORTED_TYPE: "Only PDF and DOCX files are supported in this MVP.",
  FILE_TOO_LARGE: "The file is larger than 10MB. Upload a smaller file.",
  ANALYSIS_ERROR: "Analysis failed. Please retry in a moment.",
};

function toUiError(payload: {
  message: string;
  errorCode?: string;
  details?: ApiErrorDetails;
}): UiError {
  return {
    message:
      payload.message || "Something went wrong while processing your request.",
    code: payload.errorCode,
    hint:
      payload.details?.hint ||
      (payload.errorCode ? ERROR_HINTS[payload.errorCode] : undefined),
    requestId: payload.details?.requestId,
  };
}

function toNetworkError(error: unknown): UiError {
  return {
    message: "Request failed before the server could complete processing.",
    hint:
      error instanceof Error
        ? error.message
        : "Please check your network and try again.",
  };
}

const store = useSessionStore();
const fileInput = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);
const isDragging = ref(false);
const jobDescription = ref("");

const isProcessing = computed(
  () =>
    store.status === "uploading" ||
    store.status === "parsing" ||
    store.status === "analyzing",
);

const canSubmit = computed(
  () =>
    selectedFile.value !== null &&
    jobDescription.value.trim().length >= 20 &&
    !isProcessing.value,
);

const submitButtonText = computed(() => {
  switch (store.status) {
    case "uploading":
      return "Uploading...";
    case "parsing":
      return "Parsing...";
    case "analyzing":
      return "Analyzing...";
    case "ready":
      return "Analyze";
    default:
      return "Analyze Resume";
  }
});

function openFilePicker() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    selectedFile.value = input.files[0];
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files?.[0]) {
    const file = files[0];
    if (file.name.endsWith(".pdf") || file.name.endsWith(".docx")) {
      selectedFile.value = file;
    }
  }
}

function clearFile() {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

async function submitAnalysis() {
  if (!selectedFile.value || !jobDescription.value.trim()) return;

  store.setStatus("uploading");
  store.setError(null);

  try {
    const formData = new FormData();
    formData.append("file", selectedFile.value);

    const uploadRes = await $fetch<UploadResponse>("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.success || !uploadRes.data) {
      store.setError(toUiError(uploadRes));
      return;
    }

    store.setSession({
      sessionId: uploadRes.data.sessionId,
      fileName: uploadRes.data.fileName,
      fileType: uploadRes.data.fileType as "pdf" | "docx",
      textLength: uploadRes.data.textLength,
    });

    store.setJobDescription(jobDescription.value.trim());
    store.setStatus("analyzing");

    const analyzeRes = await $fetch<AnalyzeResponse>("/api/analyze", {
      method: "POST",
      body: {
        sessionId: uploadRes.data.sessionId,
        jobDescription: jobDescription.value.trim(),
      },
    });

    if (!analyzeRes.success || !analyzeRes.data) {
      store.setError(toUiError(analyzeRes));
      return;
    }

    store.setAnalysis(analyzeRes.data);
    navigateTo("/results");
  } catch (error) {
    store.setError(toNetworkError(error));
  }
}
</script>

<style scoped>
:deep(.inline-flex) {
  display: inline-block !important;
}
:global(.inline-flex) {
  display: inline-block !important;
}
</style>
