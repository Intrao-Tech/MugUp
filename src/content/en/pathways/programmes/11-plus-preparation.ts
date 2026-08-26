import type { ProgrammePage } from "@/content/types";

// Copy source: client doc "British Education Pathways.docx", Page 2 (verbatim where provided).
export const page: ProgrammePage = {
  slug: "11-plus-preparation",
  group: "education-pathways",
  cardTitle: "11+ Preparation",
  cardBlurb:
    "Our personalised preparation develops the reasoning skills, academic confidence, and subject knowledge children need to perform at their best and thrive in selective education.",
  atAGlance: [
    { label: "Age", value: "9–11" },
    { label: "School Years", value: "Year 4–5" },
    { label: "Format", value: "Online & In Person" },
    { label: "Assessment", value: "Included" },
  ],
  meta: {
    title: "11+ Preparation | Mug.Up",
    description:
      "Expert 11+ preparation covering verbal and non-verbal reasoning, English and maths, with mock exams and personalised feedback for grammar school entry.",
  },
  hero: {
    title: "11+ Preparation",
    subtitle: "Opening Doors to Selective Education",
    body: [
      "Success in the 11+ is about more than passing an entrance examination.",
      "Our personalised preparation develops the reasoning skills, academic confidence, and subject knowledge children need to perform at their best and thrive in selective education.",
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
              title: "Verbal Reasoning",
              body: "Develop logical thinking, vocabulary, and advanced language skills.",
            },
            {
              title: "Non-Verbal Reasoning",
              body: "Strengthen visual reasoning, pattern recognition, and analytical thinking.",
            },
            {
              title: "English",
              body: "Build reading comprehension, grammar, vocabulary, and writing confidence.",
            },
            {
              title: "Mathematics",
              body: "Develop mathematical reasoning, accuracy, and problem-solving skills.",
            },
            {
              title: "Exam Readiness",
              body: "Practise with mock examinations, time management strategies, and personalised feedback.",
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
            "Greater academic confidence.",
            "Strong reasoning and analytical thinking skills.",
            "Familiarity with the 11+ examination format.",
            "Excellent preparation for Grammar School and selective school entry.",
          ],
        },
      ],
    },
    {
      id: "beyond",
      title: "Beyond the 11+",
      intro: "Opening doors to future opportunities.",
      blocks: [
        {
          type: "paragraph",
          text: "The 11+ is not the destination—it is the beginning of a new educational journey.",
        },
        {
          type: "cards",
          cards: [
            {
              title: "Selective Education",
              body: "Access Grammar Schools and other selective educational pathways.",
            },
            {
              title: "Academic Challenge",
              body: "Learn in an environment designed to stretch and inspire.",
            },
            {
              title: "Future Success",
              body: "Build strong foundations for GCSE, A Levels, university, and beyond.",
            },
            {
              title: "Lifelong Learning",
              body: "Develop resilience, curiosity, and a genuine love of learning.",
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
          body: "Every child's strengths are different. Our personalised assessment helps us evaluate your child's academic readiness, reasoning skills, and potential, allowing us to recommend the preparation pathway that gives them the best opportunity to succeed in the 11+ examination.",
          cta: { label: "Get Expert Guidance", href: "/book-assessment" },
        },
      ],
    },
  ],
};
