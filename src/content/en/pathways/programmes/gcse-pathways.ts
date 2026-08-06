import type { ProgrammePage } from "@/content/types";

// Copy source: client doc "British Education Pathways.docx", Page 4 (verbatim where provided).
export const page: ProgrammePage = {
  slug: "gcse-pathways",
  group: "education-pathways",
  cardTitle: "GCSE Pathways",
  cardBlurb:
    "At Mug.Up, we help students build the knowledge, confidence, and exam skills needed to achieve their potential and keep every future pathway open.",
  atAGlance: [
    { label: "Age", value: "14–16 years" },
    { label: "School Years", value: "Year 10–11" },
    { label: "Format", value: "Online & In Person" },
    { label: "Assessment", value: "Included" },
  ],
  meta: {
    title: "GCSE Pathways | Mug.Up",
    description:
      "GCSE support for Years 10–11: core subjects, exam strategies, mock examinations and personalised feedback to achieve results that keep options open.",
  },
  hero: {
    title: "GCSE Pathways",
    subtitle: "Building Results That Shape Future Opportunities",
    body: [
      "GCSEs are one of the most important milestones in the British education system.",
      "The results students achieve influence Post-16 pathways, A Levels, college courses, apprenticeships, university options, and future career opportunities.",
      "At Mug.Up, we help students build the knowledge, confidence, and exam skills needed to achieve their potential and keep every future pathway open.",
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
              title: "Core GCSE Subjects",
              body: "English Language, English Literature, Maths, Science, and Humanities.",
            },
            {
              title: "Exam Strategies",
              body: "Develop effective revision techniques, exam planning, and time management.",
            },
            {
              title: "Subject Confidence",
              body: "Strengthen understanding through targeted academic support.",
            },
            {
              title: "Examination Practice",
              body: "Prepare through mock examinations and personalised feedback.",
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
            "Stronger understanding across GCSE subjects.",
            "Greater confidence approaching examinations.",
            "Effective revision and independent learning skills.",
            "Results that support future educational opportunities.",
          ],
        },
      ],
    },
    {
      id: "beyond",
      title: "Beyond GCSEs",
      intro: "Strong results today. More choices tomorrow.",
      blocks: [
        {
          type: "paragraph",
          text: "GCSE success creates opportunities that extend far beyond Year 11.",
        },
        {
          type: "cards",
          cards: [
            {
              title: "Post-16 Pathways",
              body: "Progress to A Levels, College, T Levels, or Apprenticeships.",
            },
            {
              title: "University Opportunities",
              body: "Keep competitive university pathways open.",
            },
            {
              title: "Career Readiness",
              body: "Build the knowledge and qualifications valued by employers.",
            },
            {
              title: "Future Confidence",
              body: "Move into the next stage of education with clarity and ambition.",
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
          body: "Every student's educational journey is unique. Our personalised assessment helps us identify current strengths, highlight opportunities for improvement, and recommend the pathway that will maximise future GCSE success.",
          cta: { label: "Book Your Assessment", href: "/book-assessment" },
        },
      ],
    },
  ],
};
