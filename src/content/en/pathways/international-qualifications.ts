import type { Page } from "@/content/types";

// Copy source: "Mug.Up_Website_Updates_Final.docx" §3 (final approved copy).
export const page: Page = {
  meta: {
    title: "International Language Tests | Mug.Up",
    description:
      "Preparation for internationally recognised language tests — IELTS, Cambridge English, LanguageCert and more — for education, work, migration and mobility.",
  },
  hero: {
    eyebrow: "Tests for Global Opportunities",
    title: "International Language Tests",
    body: [
      "Preparation for internationally recognised language tests for study, work, migration and international mobility.",
    ],
    ctas: [{ label: "Get Expert Guidance", href: "/book-assessment" }],
  },
  sections: [
    {
      id: "qualifications-we-cover",
      title: "Tests We Cover",
      intro:
        "English qualifications are supported by dedicated preparation programmes below; preparation for other languages' tests is arranged through our language programmes.",
      blocks: [
        {
          type: "list",
          items: [
            "English: IELTS · Cambridge English · LanguageCert (SELT)",
            "Spanish: DELE · SIELE",
            "French: DELF · DALF · TCF",
            "German: Goethe-Zertifikat · telc Deutsch · TestDaF",
            "Italian: CILS · CELI · PLIDA",
            "Portuguese: CAPLE",
          ],
        },
      ],
    },
    {
      id: "who-it-is-for",
      title: "Who Is It For?",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "University & College Applicants",
              body: "Evidence the English level required for study in the UK or abroad.",
            },
            {
              title: "Professionals",
              body: "Meet the language requirements of employers, regulators and professional bodies.",
            },
            {
              title: "Visa & Settlement Applicants",
              body: "Sit a UKVI-approved SELT for visa, settlement and citizenship applications.",
            },
            {
              title: "Families Relocating",
              body: "Show the English level asked for when moving to a new country.",
            },
          ],
        },
      ],
    },
    {
      id: "how-it-works",
      title: "How It Works",
      intro: "From choosing the right test to exam day.",
      blocks: [
        {
          type: "steps",
          steps: [
            {
              title: "Expert Guidance",
              body: "We discuss your goal — study, work, migration or mobility — and identify the test that meets the requirement.",
            },
            {
              title: "Assessment",
              body: "Where it helps, a short assessment establishes your current level and a realistic target score.",
            },
            {
              title: "Preparation",
              body: "Structured preparation with experienced tutors, exam strategies, mock tests and personalised feedback.",
            },
            {
              title: "Exam Day",
              body: "We help you register with the right exam board and prepare for the format you will face.",
            },
          ],
        },
      ],
    },
    {
      id: "start-cta",
      blocks: [
        {
          type: "cta",
          title: "Not sure which test you need?",
          body: "A short assessment matches your goal — university, work, visa or mobility — to the right test and preparation plan.",
          cta: { label: "Get Expert Guidance", href: "/book-assessment" },
        },
      ],
    },
  ],
};
