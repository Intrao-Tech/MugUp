import type { ProgrammePage } from "@/content/types";

// Copy source: client doc "British Education Pathways.docx", Page 1 (verbatim where provided).
export const page: ProgrammePage = {
  slug: "sats-preparation",
  group: "education-pathways",
  cardTitle: "SATs Preparation",
  cardBlurb:
    "At Mug.Up, we help children build the literacy, numeracy, and learning habits that prepare them for a confident transition into secondary school and long-term academic success.",
  atAGlance: [
    { label: "Age", value: "9–11" },
    { label: "School Years", value: "Year 5–6" },
    { label: "Format", value: "Online & In Person" },
    { label: "Assessment", value: "Included" },
  ],
  meta: {
    title: "SATs Preparation | Mug.Up",
    description:
      "Personalised SATs preparation for Years 5–6: reading, grammar, punctuation and spelling, maths and mock exams for a confident move to secondary school.",
  },
  hero: {
    title: "SATs Preparation",
    subtitle: "Building Strong Foundations for Secondary School",
    body: [
      "SATs are an important milestone in your child's educational journey.",
      "At Mug.Up, we help children build the literacy, numeracy, and learning habits that prepare them for a confident transition into secondary school and long-term academic success.",
    ],
  },
  sections: [
    {
      id: "what-you-will-learn",
      title: "What Your Child Will Learn",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "Reading Comprehension",
              body: "Develop the confidence to understand, analyse, and respond to increasingly challenging texts.",
            },
            {
              title: "Grammar, Punctuation & Spelling",
              body: "Strengthen writing accuracy, vocabulary, and written communication.",
            },
            {
              title: "Mathematics",
              body: "Build fluency in arithmetic, reasoning, and problem solving.",
            },
            {
              title: "Exam Readiness",
              body: "Prepare through mock SATs, effective exam techniques, and personalised feedback.",
            },
          ],
        },
      ],
    },
    {
      id: "what-you-will-achieve",
      title: "What Your Child Will Achieve",
      blocks: [
        {
          type: "list",
          items: [
            "Strong literacy and numeracy skills.",
            "Greater confidence across the primary curriculum.",
            "Independent learning habits that support future success.",
            "A smooth transition into Year 7 and secondary education.",
          ],
        },
      ],
    },
    {
      id: "beyond",
      title: "Beyond SATs",
      intro: "Strong foundations today. Greater opportunities tomorrow.",
      blocks: [
        {
          type: "paragraph",
          text: "SATs preparation is not simply about achieving strong results. It helps children develop the confidence, resilience, and academic skills that support every stage of their educational journey.",
        },
        {
          type: "cards",
          cards: [
            {
              title: "A Confident Start to Secondary School",
              body: "Begin Year 7 ready for new academic expectations.",
            },
            {
              title: "Stronger Core Skills",
              body: "Build literacy and numeracy that support success across every subject.",
            },
            {
              title: "Academic Confidence",
              body: "Develop independence, resilience, and positive learning habits.",
            },
            {
              title: "Future Readiness",
              body: "Create strong foundations for GCSE and future educational opportunities.",
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
          title: "Start with the Right Guidance",
          body: "Every learner has unique strengths, ambitions, and learning needs. Our personalised assessment helps us identify the pathway that will give your child the strongest foundation for long-term success.",
          cta: { label: "Get Expert Guidance", href: "/book-assessment" },
        },
      ],
    },
  ],
};
