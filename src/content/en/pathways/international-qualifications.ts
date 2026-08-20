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
    ctas: [{ label: "Book an Assessment", href: "/book-assessment" }],
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
      id: "start-cta",
      blocks: [
        {
          type: "cta",
          title: "Not sure which test you need?",
          body: "A short assessment matches your goal — university, work, visa or mobility — to the right test and preparation plan.",
          cta: { label: "Book an Assessment", href: "/book-assessment" },
        },
      ],
    },
  ],
};
