import type { ProgrammePage } from "@/content/types";

// Copy source: client doc "British Education Pathways.docx", Page 11 (verbatim where provided).
export const page: ProgrammePage = {
  slug: "esol",
  group: "english-qualifications",
  cardTitle: "ESOL",
  cardBlurb:
    "Practical English for everyday life, work, and successful integration in the UK.",
  meta: {
    title: "ESOL Courses | Mug.Up",
    description:
      "ESOL with Mug.Up helps adults build practical English for everyday life, work and integration in the UK — from Entry Level to Level 2, online or in person.",
  },
  hero: {
    eyebrow: "English for Speakers of Other Languages",
    title: "ESOL",
    subtitle: "Building Confidence for Life, Work and Integration in the UK",
    body: [
      "Learning English is about far more than passing an exam.",
      "It is about communicating with confidence, accessing education, finding employment, supporting your family, and feeling at home in everyday life in the UK.",
      "At Mug.Up, our ESOL programmes help learners develop practical English skills while building the confidence to live, work, and thrive in Britain.",
    ],
    ctas: [{ label: "Get Expert Guidance", href: "/book-assessment" }],
  },
  atAGlance: [
    { label: "Level", value: "Entry Level – Level 2" },
    { label: "Recommended Age", value: "Adults" },
    { label: "Format", value: "Online & In Person" },
    { label: "Assessment", value: "Included" },
  ],
  sections: [
    {
      id: "why-choose",
      title: "Why Choose ESOL?",
      intro: "Strong English skills create opportunities.",
      blocks: [
        {
          type: "paragraph",
          text: "Whether your goal is finding employment, communicating with your child's school, accessing healthcare and public services, or continuing your education, ESOL provides the language skills needed to participate confidently in everyday life in the UK.",
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
              title: "Everyday English",
              body: "Develop practical communication skills for daily life in the UK.",
            },
            {
              title: "Speaking, Listening, Reading & Writing",
              body: "Build confidence across all four language skills through real-life situations.",
            },
            {
              title: "Workplace English",
              body: "Improve the communication skills needed for employment and professional development.",
            },
            {
              title: "Practical Life Skills",
              body: "Develop the language needed to access healthcare, education, public services, and everyday interactions with confidence.",
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
            "Greater confidence communicating in English every day.",
            "Stronger practical language skills for work, education, and daily life.",
            "Increased independence and confidence living in the UK.",
            "Improved opportunities for employment, further education, and long-term integration.",
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
          body: "Every learner has different experiences, goals, and ambitions. Our personalised assessment helps us understand your current English level and recommend the ESOL programme that best supports your learning journey and future opportunities.",
          cta: { label: "Get Expert Guidance", href: "/book-assessment" },
        },
      ],
    },
  ],
};
