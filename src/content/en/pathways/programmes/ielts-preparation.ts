import type { ProgrammePage } from "@/content/types";

// Copy source: client doc "British Education Pathways.docx", Page 8 (verbatim where provided).
export const page: ProgrammePage = {
  slug: "ielts-preparation",
  group: "international-qualifications",
  cardTitle: "IELTS Preparation",
  cardBlurb:
    "Academic, General Training and UKVI preparation to help you achieve your target band score with confidence.",
  meta: {
    title: "IELTS Preparation | Mug.Up",
    description:
      "IELTS preparation with Mug.Up: Academic, General Training and UKVI modules, expert tutors, mock tests and score-focused support to reach your target band.",
  },
  hero: {
    eyebrow: "Academic • General • UKVI",
    title: "IELTS Preparation",
    subtitle: "Achieve the IELTS Score You Need for Your Next Step",
    body: [
      "Whether you're applying to university, pursuing professional registration, or preparing for UK immigration, IELTS is one of the world's most recognised English language qualifications.",
      "At Mug.Up, we combine personalised learning, expert guidance, and realistic exam practice to help you achieve your target score with confidence.",
    ],
    ctas: [{ label: "Book Your Assessment", href: "/book-assessment" }],
  },
  atAGlance: [
    { label: "Level", value: "B1–C1" },
    { label: "Recommended Age", value: "16+" },
    { label: "Format", value: "Online & In Person" },
    { label: "Assessment", value: "Included" },
  ],
  sections: [
    {
      id: "why-choose",
      title: "Why Choose IELTS?",
      intro: "Different goals require different IELTS modules.",
      blocks: [
        {
          type: "cards",
          cards: [
            { title: "Academic IELTS", body: "For university and higher education." },
            { title: "General Training", body: "For employment, professional registration, and migration." },
            { title: "IELTS UKVI", body: "For UK Visas and Immigration applications." },
          ],
        },
        {
          type: "paragraph",
          text: "We'll help you choose the right exam and prepare with confidence.",
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
              title: "All Four Language Skills",
              body: "Develop your Reading, Writing, Listening, and Speaking skills through structured practice.",
            },
            {
              title: "Exam Strategies",
              body: "Learn proven techniques, assessment criteria, and effective time management.",
            },
            {
              title: "Mock IELTS Tests",
              body: "Build confidence through realistic exam practice and personalised feedback.",
            },
            {
              title: "Score-Focused Preparation",
              body: "Receive targeted support designed around your current level, target band score, and exam timeline.",
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
            "Greater confidence across all four language skills.",
            "A clear understanding of IELTS assessment criteria.",
            "Effective exam techniques and time management strategies.",
            "The best possible opportunity to achieve your target band score.",
            "An internationally recognised qualification that supports university, career, and immigration goals.",
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
          body: "Every learner has different goals, timelines, and target scores. Our personalised assessment helps us identify your current English level, recommend the most suitable IELTS pathway, and create a preparation plan tailored to your individual objectives.",
          cta: { label: "Book Your Assessment", href: "/book-assessment" },
        },
      ],
    },
  ],
};
