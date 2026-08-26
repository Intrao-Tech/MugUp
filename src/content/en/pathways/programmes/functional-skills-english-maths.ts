import type { ProgrammePage } from "@/content/types";

// Copy source: client doc "British Education Pathways.docx", Page 10 (verbatim where provided).
export const page: ProgrammePage = {
  slug: "functional-skills-english-maths",
  group: "english-qualifications",
  cardTitle: "Functional Skills English & Maths",
  cardBlurb:
    "Practical, nationally recognised English and Maths qualifications for work, further education, and everyday life.",
  meta: {
    title: "Functional Skills English & Maths | Mug.Up",
    description:
      "Functional Skills English and Maths with Mug.Up: practical, nationally recognised qualifications for work, apprenticeships, further education and daily life.",
  },
  hero: {
    title: "Functional Skills English & Maths",
    subtitle: "Essential Qualifications for Work, Education and Everyday Life",
    body: [
      "Functional Skills qualifications provide the practical English and Maths skills needed to succeed in work, further education, apprenticeships, and everyday life in the UK.",
      "At Mug.Up, we help learners build confidence, develop real-world skills, and achieve nationally recognised qualifications that open doors to future opportunities.",
    ],
    ctas: [{ label: "Get Expert Guidance", href: "/book-assessment" }],
  },
  atAGlance: [
    { label: "Level", value: "Entry Level – Level 2" },
    { label: "Recommended Age", value: "16+" },
    { label: "Format", value: "Online & In Person" },
    { label: "Assessment", value: "Included" },
  ],
  sections: [
    {
      id: "why-choose",
      title: "Why Choose Functional Skills?",
      intro:
        "Functional Skills qualifications are widely recognised by employers, colleges, apprenticeship providers, and many universities across the UK.",
      blocks: [
        {
          type: "paragraph",
          text: "They demonstrate practical English and Maths skills that support career progression, further education, and greater independence in everyday life.",
        },
      ],
    },
    {
      id: "what-we-cover",
      title: "What We Cover",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "Functional English",
              body: "Develop practical reading, writing, speaking, and communication skills for work and daily life.",
            },
            {
              title: "Functional Mathematics",
              body: "Build confidence using maths in real-life situations, the workplace, and further study.",
            },
            {
              title: "Workplace & Everyday Skills",
              body: "Strengthen problem-solving, communication, and practical decision-making skills.",
            },
            {
              title: "Exam Preparation",
              body: "Prepare through structured learning, mock assessments, and personalised feedback.",
            },
          ],
        },
      ],
    },
    {
      id: "what-you-will-achieve",
      title: "What You'll Achieve",
      blocks: [
        {
          type: "list",
          items: [
            "Greater confidence using English and Maths in everyday situations.",
            "Nationally recognised Functional Skills qualifications.",
            "Improved opportunities for employment, apprenticeships, and further education.",
            "Practical skills that support independence, work, and lifelong learning.",
          ],
        },
      ],
    },
    {
      id: "start-cta",
      blocks: [
        {
          type: "cta",
          title: "Start with the Right Guidance",
          body: "Every learner starts from a different point. Our personalised assessment helps us identify your current level, understand your goals, and recommend the Functional Skills pathway that best supports your education, employment, or career ambitions.",
          cta: { label: "Get Expert Guidance", href: "/book-assessment" },
        },
      ],
    },
  ],
};
