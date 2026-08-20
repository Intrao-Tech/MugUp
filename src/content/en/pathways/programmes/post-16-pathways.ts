import type { ProgrammePage } from "@/content/types";

// Copy source: client doc "British_Education_Pathways.docx", Page 5 (verbatim where provided).
export const page: ProgrammePage = {
  slug: "post-16-pathways",
  group: "education-pathways",
  cardTitle: "Post-16 Pathways",
  cardBlurb: "A-Levels, BTEC, T-Levels, Apprenticeships—we help you choose the right path.",
  meta: {
    title: "Post-16 Pathways | Mug.Up",
    description:
      "A Levels, BTEC, T Levels or an Apprenticeship? Mug.Up helps students aged 16–18 choose the right Post-16 pathway and prepare for university and future careers.",
  },
  hero: {
    title: "Post-16 Pathways",
    subtitle: "Choosing the Right Path for Future Success",
    body: [
      "The decisions students make after GCSE can shape their university options, career opportunities, and future ambitions.",
      "Whether your child is considering A Levels, College, T Levels, BTEC, or an Apprenticeship, choosing the right pathway begins with understanding their strengths, interests, and long-term goals.",
      "At Mug.Up, we help students make informed decisions, build academic confidence, and prepare successfully for the next stage of their educational journey.",
    ],
  },
  atAGlance: [
    { label: "Age", value: "16–18 years" },
    { label: "School Years", value: "Year 12–13" },
    { label: "Format", value: "Online & In Person" },
    { label: "Assessment", value: "Included" },
  ],
  sections: [
    {
      id: "what-you-will-learn",
      title: "What We Support",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "Educational Pathway Planning",
              body: "Explore the Post-16 options that best match each student's ambitions and strengths.",
            },
            {
              title: "Academic Support",
              body: "Subject support for A Levels and guidance across Post-16 programmes.",
            },
            {
              title: "Independent Learning",
              body: "Develop advanced study skills, academic writing, and critical thinking.",
            },
            {
              title: "University & Career Planning",
              body: "Build a clear plan for higher education, apprenticeships, or future careers.",
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
            "Confidence in choosing the right Post-16 pathway.",
            "Stronger academic and independent learning skills.",
            "Greater readiness for A Levels, College, T Levels, or Apprenticeships.",
            "A clear direction for university and future career opportunities.",
          ],
        },
      ],
    },
    {
      id: "beyond",
      title: "Looking Beyond Sixth Form",
      intro: "Every decision today creates opportunities tomorrow.",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "University",
              body: "Prepare for competitive UK and international university applications.",
            },
            {
              title: "Professional Pathways",
              body: "Explore apprenticeships, technical qualifications, and career-focused routes.",
            },
            {
              title: "Academic Confidence",
              body: "Develop the independence and resilience needed for higher education.",
            },
            {
              title: "Future Success",
              body: "Build strong foundations for lifelong learning and professional growth.",
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
          body: "Every student has unique ambitions, strengths, and aspirations. Our personalised assessment helps us recommend the Post-16 pathway that best supports your child's long-term educational and career goals.",
          cta: { label: "Book an Assessment", href: "/book-assessment" },
        },
      ],
    },
  ],
};
