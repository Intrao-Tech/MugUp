import type { ProgrammePage } from "@/content/types";

// Copy source: client doc "British_Education_Pathways.docx", Page 6 (verbatim where provided).
export const page: ProgrammePage = {
  slug: "university-application-support",
  group: "education-pathways",
  cardTitle: "University & College Applications",
  cardBlurb: "Personalised guidance for university applications, personal statements and interviews.",
  meta: {
    title: "University & College Application Support | Mug.Up",
    description:
      "UCAS applications, personal statements, interviews and admissions strategy — Mug.Up guides students through every stage of applying to UK universities.",
  },
  hero: {
    title: "University & College Application Support",
    subtitle: "Helping Students Take the Next Step with Confidence",
    body: [
      "Applying to university is about far more than completing a UCAS application.",
      "Choosing the right course, preparing a compelling application, and presenting achievements with confidence all play a vital role in securing future opportunities.",
      "At Mug.Up, we guide students through every stage of the admissions journey, helping them make informed decisions and submit applications that reflect their full potential.",
    ],
  },
  atAGlance: [
    { label: "Age", value: "16–18+" },
    { label: "Level", value: "Post-16 Students" },
    { label: "Format", value: "Online & In Person" },
    { label: "Assessment", value: "Included" },
  ],
  sections: [
    {
      id: "what-you-will-learn",
      title: "How We Support Students",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "University & Course Selection",
              body: "Identify universities and courses that align with academic strengths and career ambitions.",
            },
            {
              title: "UCAS & Personal Statement Support",
              body: "Create applications that clearly communicate each student's potential.",
            },
            {
              title: "Interview Preparation",
              body: "Build confidence for interviews and admissions conversations.",
            },
            {
              title: "Admissions Strategy",
              body: "Plan timelines, entry requirements, English language qualifications, and every step of the application process.",
            },
          ],
        },
      ],
    },
    {
      id: "what-you-will-achieve",
      title: "What Students Will Achieve",
      blocks: [
        {
          type: "list",
          items: [
            "A clear understanding of the university admissions process.",
            "A well-prepared and competitive UCAS application.",
            "Greater confidence throughout interviews and admissions.",
            "A stronger opportunity to receive offers from suitable universities.",
          ],
        },
      ],
    },
    {
      id: "beyond",
      title: "Beyond University",
      intro: "University is the beginning of the next chapter.",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "The Right Degree",
              body: "Choose a course aligned with long-term ambitions.",
            },
            {
              title: "Career Opportunities",
              body: "Build qualifications that support future professional success.",
            },
            {
              title: "Professional Confidence",
              body: "Develop the skills needed to thrive in higher education and beyond.",
            },
            {
              title: "Lifelong Growth",
              body: "Begin the next stage with clarity, confidence, and purpose.",
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
          body: "Every student's journey is different. Our personalised assessment helps us understand academic strengths, career aspirations, and university goals, allowing us to recommend the admissions strategy and educational pathway best suited to long-term success.",
          cta: { label: "Book Your Assessment", href: "/book-assessment" },
        },
      ],
    },
  ],
};
