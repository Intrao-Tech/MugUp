import type { ProgrammePage } from "@/content/types";

// Copy source: client doc "British Education Pathways.docx", Page 3 (verbatim where provided).
export const page: ProgrammePage = {
  slug: "secondary-education",
  group: "education-pathways",
  cardTitle: "Secondary Education",
  cardBlurb:
    "At Mug.Up, we help students strengthen their academic foundations, close learning gaps, and prepare for a confident transition into GCSE studies.",
  atAGlance: [
    { label: "Age", value: "11–14 years" },
    { label: "School Years", value: "Year 7–9" },
    { label: "Format", value: "Online & In Person" },
    { label: "Assessment", value: "Included" },
  ],
  meta: {
    title: "Secondary Education (Years 7–9) | Mug.Up",
    description:
      "Academic support for Years 7–9: academic English, core subjects and study skills that close learning gaps and build strong foundations for GCSE success.",
  },
  hero: {
    title: "Secondary Education",
    subtitle: "Building the Foundations for GCSE Success",
    body: [
      "The most important GCSE preparation begins long before Year 10.",
      "During Years 7–9, students develop the subject knowledge, academic English, study habits, and confidence that shape future GCSE success. This is also the stage when many schools begin making decisions that influence GCSE subject choices and Higher Tier pathways.",
      "At Mug.Up, we help students strengthen their academic foundations, close learning gaps, and prepare for a confident transition into GCSE studies.",
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
              title: "Academic English",
              body: "Develop the language skills needed to succeed across every subject.",
            },
            {
              title: "Core Subjects",
              body: "Strengthen understanding in English, Mathematics, Science, and Humanities.",
            },
            {
              title: "Study Skills",
              body: "Build organisation, revision strategies, and independent learning habits.",
            },
            {
              title: "GCSE Readiness",
              body: "Prepare for informed GCSE subject choices and increasing academic expectations.",
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
            "Strong academic foundations before GCSE studies begin.",
            "Greater confidence across core subjects.",
            "Improved academic vocabulary and independent learning skills.",
            "A smooth transition into Year 10 and GCSE courses.",
          ],
        },
      ],
    },
    {
      id: "beyond",
      title: "Looking Ahead to GCSE",
      intro: "Today's progress shapes tomorrow's opportunities.",
      blocks: [
        {
          type: "paragraph",
          text: "The choices students make in Years 7–9 influence far more than their next school year.",
        },
        {
          type: "cards",
          cards: [
            {
              title: "GCSE Readiness",
              body: "Build the knowledge and confidence needed before Year 10.",
            },
            {
              title: "Informed Subject Choices",
              body: "Select GCSE options that reflect strengths, interests, and future ambitions.",
            },
            {
              title: "Academic Independence",
              body: "Develop effective study habits that support long-term success.",
            },
            {
              title: "Future Opportunities",
              body: "Create the strongest possible foundation for GCSE, Post-16 education, and beyond.",
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
          body: "Every student develops at their own pace. Our personalised assessment helps us understand your child's current level, identify opportunities for growth, and recommend the learning pathway that will best support future GCSE success.",
          cta: { label: "Book an Assessment", href: "/book-assessment" },
        },
      ],
    },
  ],
};
