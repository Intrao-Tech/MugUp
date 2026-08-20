import type { Page } from "@/content/types";

// Copy source: client doc "British Education Pathways.docx", hub part (verbatim where provided).
// The programme card grids are rendered from the programme registry by the page component.
export const page: Page = {
  meta: {
    title: "British Education Pathways | Mug.Up",
    description:
      "Expert guidance through every stage of the UK education system — from primary and SATs to GCSEs, A-Levels and university preparation with Mug.Up.",
  },
  hero: {
    title: "British Education Pathways",
    subtitle: "Expert Guidance Through Every Stage of the UK Education System",
    body: [
      "Understanding the British education system can feel overwhelming, especially for families navigating it for the first time.",
      "At Mug.Up, we help children, teenagers, and families make informed educational decisions, build strong academic foundations, and confidently progress through every stage of the UK education system.",
      "From Primary School and SATs to GCSEs, A-Levels, college, and university preparation, our programmes are designed to support each learner’s individual goals and future opportunities.",
    ],
    ctas: [{ label: "Book an Assessment", href: "/book-assessment" }],
  },
  sections: [
    {
      id: "educational-journey",
      title: "Your Educational Journey",
      intro: "Every stage opens new opportunities. We’re here to guide you every step of the way.",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              eyebrow: "Ages 6–11 · Years 1–6",
              title: "Primary Education",
              body: "Building confidence, literacy, numeracy, and strong academic foundations.",
            },
            {
              eyebrow: "Ages 9–11 · Years 5–6",
              title: "SATs Preparation",
              body: "Focused support to achieve success in Key Stage assessments with confidence.",
              href: "/pathways/british-education/sats-preparation",
            },
            {
              eyebrow: "Ages 9–11 · Years 5–6",
              title: "11+ Preparation",
              body: "Expert preparation for grammar schools and selective school entry.",
              href: "/pathways/british-education/11-plus-preparation",
            },
            {
              eyebrow: "Ages 11–14 · Years 7–9",
              title: "Secondary Education",
              body: "Academic support and guidance through the key middle school years.",
              href: "/pathways/british-education/secondary-education",
            },
            {
              eyebrow: "Ages 14–16 · Years 10–11",
              title: "GCSE Pathways",
              body: "Achieve strong GCSE results and keep your options open for the future.",
              href: "/pathways/british-education/gcse-pathways",
            },
            {
              eyebrow: "Ages 16–18",
              title: "Post-16 Pathways",
              body: "A-Levels, BTEC, T-Levels, Apprenticeships—we help you choose the right path.",
              href: "/pathways/british-education/post-16-pathways",
            },
            {
              eyebrow: "Ages 17–18+",
              title: "University Applications",
              body: "Personalised guidance for university applications, personal statements and interviews.",
              href: "/pathways/british-education/university-application-support",
            },
            {
              eyebrow: "Ages 18+ · Adults, Graduates & Professionals",
              title: "Career & Beyond",
              body: "Opening doors to meaningful careers and lifelong opportunities.",
            },
          ],
        },
      ],
    },
    {
      // Contextual link ONLY — the full page lives under Global Integration
      // (final doc §4: one boarding page, no duplicate copy).
      id: "boarding-crosslink",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "British Boarding Schools for International Students",
              body: "Admissions guidance and academic preparation for international families considering boarding education in the UK.",
              href: "/pathways/global-integration/boarding-schools",
              linkLabel: "Explore British Boarding Schools",
            },
          ],
        },
      ],
    },
    {
      id: "uk-qualifications",
      title: "UK Qualifications & Exams",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "ESOL Qualifications",
              body: "English language qualifications for speakers of other languages, designed to support communication for life, work and study in the UK.",
              href: "/pathways/british-education/esol",
            },
            {
              title: "Functional Skills English & Maths",
              body: "Practical, nationally recognised qualifications for work, further education and everyday life.",
              href: "/pathways/british-education/functional-skills-english-maths",
            },
            {
              title: "GCSE English & Maths",
              body: "Core UK academic qualifications widely required for further education, apprenticeships, university pathways and employment.",
            },
            {
              title: "English Language Tests",
              body: "IELTS, IELTS for UKVI, Cambridge English, LanguageCert, PTE and Trinity exams for academic, professional and immigration purposes.",
              href: "/pathways/global-integration/qualifications",
            },
          ],
        },
      ],
    },
    {
      id: "why-mugup",
      title: "Why Mug.Up",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "Personalised Support",
              body: "Tailored learning for every child and every goal.",
            },
            {
              title: "Expert Teachers",
              body: "Qualified, experienced and passionate about progress.",
            },
            {
              title: "Proven Results",
              body: "Students achieve strong results and brighter futures.",
            },
            {
              title: "Holistic Approach",
              body: "Academic excellence with confidence and wellbeing.",
            },
            {
              title: "Future Focused",
              body: "Preparing learners for a changing world.",
            },
          ],
        },
      ],
    },
    {
      id: "final-cta",
      blocks: [
        {
          type: "cta",
          title: "Your Child. Their Journey. Our Support.",
          body: "Education. Guidance. Opportunity.",
          note: "Trusted by families across Bedford and beyond.",
          cta: { label: "Book an Assessment", href: "/book-assessment" },
        },
      ],
    },
  ],
};
