<template>
  <div>
    <!-- Template Tabs -->
    <div class="flex gap-2 flex-wrap justify-center mb-6 pb-2 no-print">
      <button
        v-for="tmpl in templates"
        :key="tmpl.id"
        class="template-tab flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300"
        :class="[
          store.activeTemplate === tmpl.id
            ? 'active bg-green-500/10 text-green-400 border border-green-500/30'
            : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-slate-200 hover:border-slate-600',
        ]"
        @click="store.setActiveTemplate(tmpl.id)"
      >
        <UIcon :name="tmpl.icon" class="w-4 h-4" />
        {{ tmpl.name }}
      </button>
    </div>

    <!-- Template Description -->
    <p class="text-xs text-slate-500 mb-4 no-print">
      {{ activeTemplateInfo.description }}
    </p>

    <!-- Resume Preview -->
    <div class="rounded-xl p-4 border border-slate-700/50 bg-slate-100">
      <div ref="resumeRef">
        <ResumeTemplateClassic
          v-if="store.activeTemplate === 'classic'"
          :resume="resume"
        />
        <ResumeTemplateModern
          v-else-if="store.activeTemplate === 'modern'"
          :resume="resume"
        />
        <ResumeTemplateMinimal
          v-else-if="store.activeTemplate === 'minimal'"
          :resume="resume"
        />
        <ResumeTemplateExecutive
          v-else-if="store.activeTemplate === 'executive'"
          :resume="resume"
        />
        <ResumeTemplateCreative
          v-else-if="store.activeTemplate === 'creative'"
          :resume="resume"
        />
      </div>
    </div>

    <!-- Download Buttons -->
    <div class="flex gap-3 mt-5 no-print">
      <UButton
        color="primary"
        size="lg"
        :loading="downloading"
        class="flex-1"
        @click="downloadPDF"
      >
        <UIcon name="i-lucide-file-down" class="w-4 h-4 mr-2" />
        Download PDF
      </UButton>
      <UButton
        variant="outline"
        size="lg"
        :loading="downloadingDocx"
        class="flex-1"
        @click="downloadDOCX"
      >
        <UIcon name="i-lucide-file-text" class="w-4 h-4 mr-2" />
        Download DOCX
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from "~/stores/session";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Tab,
  TabStopPosition,
  TabStopType,
} from "docx";
import { saveAs } from "file-saver";
import type { StructuredResume, TemplateInfo } from "~/types";

const store = useSessionStore();
const resumeRef = ref<HTMLElement>();
const downloading = ref(false);
const downloadingDocx = ref(false);

const props = defineProps<{
  resume: StructuredResume;
}>();

const templates: TemplateInfo[] = [
  {
    id: "classic",
    name: "Classic",
    description:
      "Traditional single-column layout. Clean borders and serif-style headings. Best for corporate & traditional industries.",
    icon: "i-lucide-layout-template",
  },
  {
    id: "modern",
    name: "Modern",
    description:
      "Accent color header with timeline-style experience. Skill pills and two-column sections. Great for tech & startups.",
    icon: "i-lucide-sparkles",
  },
  {
    id: "minimal",
    name: "Minimal",
    description:
      "Generous whitespace with light typography. Understated elegance with dash-style bullets. Perfect for design roles.",
    icon: "i-lucide-minus",
  },
  {
    id: "executive",
    name: "Executive",
    description:
      "Dark header with gold accents. 2/3 + 1/3 column layout. Ideal for leadership & senior positions.",
    icon: "i-lucide-briefcase",
  },
  {
    id: "creative",
    name: "Creative",
    description:
      "Two-column with colored sidebar. Timeline experience dots and bold visual hierarchy. Great for creative professionals.",
    icon: "i-lucide-palette",
  },
];

const activeTemplateInfo = computed(
  () => templates.find((t) => t.id === store.activeTemplate) || templates[0],
);

// ─── PDF Download using html2pdf.js ───
async function downloadPDF() {
  downloading.value = true;
  try {
    const element = resumeRef.value?.querySelector(
      "#resume-content",
    ) as HTMLElement;
    if (!element) throw new Error("Resume content not found");

    // Dynamically import html2pdf.js (client-only)
    const html2pdf = (await import("html2pdf.js")).default;

    const opt = {
      margin: 0,
      filename: `${props.resume.contact.fullName || "Resume"}_${store.activeTemplate}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error("PDF download failed:", error);
  } finally {
    downloading.value = false;
  }
}

// ─── DOCX Download using docx + file-saver ───
async function downloadDOCX() {
  downloadingDocx.value = true;
  try {
    const resume = props.resume;
    const children: Paragraph[] = [];

    // ── Name ──
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resume.contact.fullName || "Resume",
            bold: true,
            size: 48,
            font: "Calibri",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
    );

    // ── Contact Info Line ──
    const contactParts: string[] = [];
    if (resume.contact.email) contactParts.push(resume.contact.email);
    if (resume.contact.phone) contactParts.push(resume.contact.phone);
    if (resume.contact.location) contactParts.push(resume.contact.location);
    if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin);
    if (resume.contact.website) contactParts.push(resume.contact.website);

    if (contactParts.length) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactParts.join("  |  "),
              size: 18,
              color: "666666",
              font: "Calibri",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          border: {
            bottom: {
              color: "999999",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        }),
      );
    }

    // ── Summary ──
    if (resume.summary) {
      children.push(createSectionHeading("PROFESSIONAL SUMMARY"));
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resume.summary,
              size: 22,
              font: "Calibri",
            }),
          ],
          spacing: { after: 200 },
        }),
      );
    }

    // ── Experience ──
    if (resume.experience.length) {
      children.push(createSectionHeading("PROFESSIONAL EXPERIENCE"));
      for (const exp of resume.experience) {
        // Title line with date on right
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.title,
                bold: true,
                size: 22,
                font: "Calibri",
              }),
              new TextRun({
                children: [
                  new Tab(),
                  `${exp.startDate} – ${exp.endDate}`,
                ],
                size: 20,
                color: "888888",
                font: "Calibri",
              }),
            ],
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: TabStopPosition.MAX,
              },
            ],
            spacing: { before: 120 },
          }),
        );
        // Company
        if (exp.company) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.company + (exp.location ? ` — ${exp.location}` : ""),
                  italics: true,
                  size: 20,
                  color: "555555",
                  font: "Calibri",
                }),
              ],
              spacing: { after: 60 },
            }),
          );
        }
        // Bullets
        for (const bullet of exp.bullets) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: bullet,
                  size: 20,
                  font: "Calibri",
                }),
              ],
              bullet: { level: 0 },
              spacing: { after: 40 },
            }),
          );
        }
      }
    }

    // ── Education ──
    if (resume.education.length) {
      children.push(createSectionHeading("EDUCATION"));
      for (const edu of resume.education) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: edu.degree,
                bold: true,
                size: 22,
                font: "Calibri",
              }),
              new TextRun({
                children: [new Tab(), edu.graduationDate],
                size: 20,
                color: "888888",
                font: "Calibri",
              }),
            ],
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: TabStopPosition.MAX,
              },
            ],
            spacing: { before: 120 },
          }),
        );
        if (edu.institution) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.institution + (edu.location ? ` — ${edu.location}` : "") + (edu.gpa ? ` | GPA: ${edu.gpa}` : ""),
                  italics: true,
                  size: 20,
                  color: "555555",
                  font: "Calibri",
                }),
              ],
              spacing: { after: 60 },
            }),
          );
        }
      }
    }

    // ── Skills ──
    if (resume.skills.length) {
      children.push(createSectionHeading("TECHNICAL SKILLS"));
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resume.skills.join("  •  "),
              size: 20,
              font: "Calibri",
            }),
          ],
          spacing: { after: 200 },
        }),
      );
    }

    // ── Projects ──
    if (resume.projects.length) {
      children.push(createSectionHeading("PROJECTS"));
      for (const proj of resume.projects) {
        const titleParts: TextRun[] = [
          new TextRun({
            text: proj.name,
            bold: true,
            size: 22,
            font: "Calibri",
          }),
        ];
        if (proj.technologies.length) {
          titleParts.push(
            new TextRun({
              text: ` | ${proj.technologies.join(", ")}`,
              size: 20,
              color: "888888",
              font: "Calibri",
            }),
          );
        }
        children.push(
          new Paragraph({
            children: titleParts,
            spacing: { before: 120 },
          }),
        );
        if (proj.description) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: proj.description,
                  size: 20,
                  color: "555555",
                  font: "Calibri",
                }),
              ],
              spacing: { after: 40 },
            }),
          );
        }
        for (const bullet of proj.bullets) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: bullet,
                  size: 20,
                  font: "Calibri",
                }),
              ],
              bullet: { level: 0 },
              spacing: { after: 40 },
            }),
          );
        }
      }
    }

    // ── Certifications ──
    if (resume.certifications.length) {
      children.push(createSectionHeading("CERTIFICATIONS"));
      for (const cert of resume.certifications) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cert.name,
                bold: true,
                size: 20,
                font: "Calibri",
              }),
              new TextRun({
                text: ` — ${cert.issuer}`,
                size: 20,
                color: "555555",
                font: "Calibri",
              }),
              new TextRun({
                children: [new Tab(), cert.date],
                size: 20,
                color: "888888",
                font: "Calibri",
              }),
            ],
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: TabStopPosition.MAX,
              },
            ],
            spacing: { after: 60 },
          }),
        );
      }
    }

    // ── Languages ──
    if (resume.languages.length) {
      children.push(createSectionHeading("LANGUAGES"));
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resume.languages.join("  •  "),
              size: 20,
              font: "Calibri",
            }),
          ],
          spacing: { after: 200 },
        }),
      );
    }

    // Build document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(
      blob,
      `${resume.contact.fullName || "Resume"}_${store.activeTemplate}.docx`,
    );
  } catch (error) {
    console.error("DOCX download failed:", error);
  } finally {
    downloadingDocx.value = false;
  }
}

function createSectionHeading(title: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 22,
        font: "Calibri",
        allCaps: true,
      }),
    ],
    spacing: { before: 300, after: 100 },
    border: {
      bottom: {
        color: "CCCCCC",
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
}
</script>
