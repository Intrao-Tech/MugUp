import type { InsightsIndexPage } from "@/content/types";

// Categories per client doc "Structure.docx" (section 4. Insights).
// Page copy is ours; real articles arrive from the client later.
export const page: InsightsIndexPage = {
  meta: {
    title: "Insights | Mug.Up",
    description:
      "Practical articles and guides on UK education, English qualifications, career development and integration — written by the Mug.Up Language Studio team.",
  },
  hero: {
    title: "Insights",
    subtitle:
      "Guidance on UK education, exams, career development and integration — practical answers to the questions learners and families ask us most.",
  },
  sections: [
    {
      id: "browse",
      title: "Browse by Category",
      blocks: [
        {
          type: "paragraph",
          text: "Browse our articles by category below — from choosing the right English qualification to settling into life, study and work in the UK. New guides are added regularly.",
        },
      ],
    },
  ],
  categories: [
    {
      id: "uk-education",
      label: "UK Education",
      blurb: "Schools, exams and university admissions across the British education system.",
    },
    {
      id: "english-qualifications",
      label: "English Qualifications",
      blurb: "IELTS, Cambridge English, SELT, ESOL — and how to choose the right exam for your goals.",
    },
    {
      id: "career-workplace",
      label: "Career & Workplace",
      blurb: "Professional English, CVs, interviews and career development in the UK.",
    },
    {
      id: "integration-uk",
      label: "Integration in the UK",
      blurb: "Practical guidance for settling into everyday life, study and work in Britain.",
    },
    {
      id: "language-learning",
      label: "Language Learning",
      blurb: "Methods, motivation and habits that make language learning effective at any age.",
    },
  ],
};
