import type { ProgrammePage } from "@/content/types";

// Copy source: client doc "British_Education_Pathways.docx", Page 7 (verbatim where provided).
export const page: ProgrammePage = {
  slug: "cambridge-english-qualifications",
  group: "international-qualifications",
  cardTitle: "Cambridge English",
  cardBlurb:
    "Internationally recognised Cambridge English exams from A2 Key to C2 Proficiency — qualifications for education, work and life.",
  meta: {
    title: "Cambridge English Qualifications | Mug.Up",
    description:
      "Prepare for Cambridge English exams from A2 Key to C2 Proficiency with Mug.Up — internationally recognised qualifications for education, work and life.",
  },
  hero: {
    title: "Cambridge English Qualifications",
    subtitle: "Internationally Recognised English Qualifications for Education, Work and Life",
    body: [
      "Cambridge English Qualifications are among the world's most respected English language certifications, recognised by universities, employers, and organisations across the globe.",
      "Whether your goal is academic success, career progression, or personal development, we help you build practical English skills and achieve an internationally recognised qualification with confidence.",
    ],
  },
  atAGlance: [
    { label: "Level", value: "A2–C2" },
    { label: "Recommended Age", value: "Children, Teens & Adults" },
    { label: "Format", value: "Online & In Person" },
    { label: "Assessment", value: "Included" },
  ],
  sections: [
    {
      id: "why-cambridge",
      title: "Why Choose Cambridge English?",
      blocks: [
        {
          type: "lead",
          text: "Cambridge English Qualifications assess real-world communication skills—not simply exam performance.",
        },
        {
          type: "paragraph",
          text: "Recognised worldwide and valid for life, they demonstrate practical English proficiency for education, employment, and everyday communication.",
        },
      ],
    },
    {
      id: "what-you-will-learn",
      title: "What We Cover",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "Cambridge Qualifications",
              body: "Preparation for Cambridge English exams from A2 Key to C2 Proficiency.",
            },
            {
              title: "All Four Language Skills",
              body: "Reading, Writing, Listening, and Speaking.",
            },
            {
              title: "Grammar & Vocabulary",
              body: "Develop practical English for study, work, and everyday life.",
            },
            {
              title: "Exam Preparation",
              body: "Mock examinations, exam techniques, time management, and personalised feedback.",
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
            "Greater confidence communicating in English.",
            "Stronger Reading, Writing, Listening, and Speaking skills.",
            "Familiarity with Cambridge examination formats and expectations.",
            "An internationally recognised qualification accepted by universities and employers worldwide.",
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
          body: "Every learner has different goals, ambitions, and starting points. Our personalised assessment helps us identify your current English level and recommend the Cambridge qualification that best supports your future plans.",
          cta: { label: "Book Your Assessment", href: "/book-assessment" },
        },
      ],
    },
  ],
};
