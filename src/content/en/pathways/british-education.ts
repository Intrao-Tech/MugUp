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
    ctas: [{ label: "Book Your Assessment", href: "/book-assessment" }],
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
              eyebrow: "3–11 Years",
              title: "Early Years & Primary Education",
              body: "Building confidence, literacy, numeracy, and strong academic foundations.",
            },
            {
              eyebrow: "10–11 Years",
              title: "SATs Preparation",
              body: "Focused support to achieve success in Key Stage assessments with confidence.",
              href: "/pathways/british-education/sats-preparation",
            },
            {
              eyebrow: "9–11 Years",
              title: "11+ Preparation",
              body: "Expert preparation for grammar schools and selective school entry.",
              href: "/pathways/british-education/11-plus-preparation",
            },
            {
              eyebrow: "11–14 Years",
              title: "Secondary Education",
              body: "Academic support and guidance through the key middle school years.",
              href: "/pathways/british-education/secondary-education",
            },
            {
              eyebrow: "14–16 Years",
              title: "GCSE Pathways",
              body: "Achieve strong GCSE results and keep your options open for the future.",
              href: "/pathways/british-education/gcse-pathways",
            },
            {
              eyebrow: "16–18 Years",
              title: "Post-16 Pathways",
              body: "A-Levels, BTEC, T-Levels, Apprenticeships—we help you choose the right path.",
              href: "/pathways/british-education/post-16-pathways",
            },
            {
              eyebrow: "18+ Years",
              title: "University Applications",
              body: "Personalised guidance for university applications, personal statements and interviews.",
              href: "/pathways/british-education/university-application-support",
            },
            {
              eyebrow: "Career",
              title: "Career & Beyond",
              body: "Opening doors to meaningful careers and lifelong opportunities.",
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
      id: "final-cta",
      blocks: [
        {
          type: "cta",
          title: "Your Child. Their Journey. Our Support.",
          body: "Education. Guidance. Opportunity.",
          note: "Trusted by families across Bedford and beyond.",
          cta: { label: "Book Your Assessment", href: "/book-assessment" },
        },
      ],
    },
  ],
};
