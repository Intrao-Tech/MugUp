import type { Page } from "@/content/types";

// Copy source: "Mug.Up_Website_Updates_Final.docx" §5 — full final copy.
// Naming rule: "British Boarding Schools for International Students",
// consistently, everywhere. One page, no duplicates (see §1 of the doc).
export const page: Page = {
  meta: {
    title: "British Boarding Schools for International Students | Mug.Up",
    description:
      "Guidance and academic preparation for international families considering UK boarding education — school selection, entrance exams, interviews and transition.",
  },
  hero: {
    eyebrow: "Finding the Right School. Building the Right Future.",
    title: "British Boarding Schools for International Students",
    body: [
      "Choosing a British boarding school is an important decision for international families — academically, personally and practically.",
      "Every school is different, with its own entry points, academic expectations, admissions process, strengths and school culture. International students may also need additional English-language preparation, entrance assessment support and guidance on transitioning into the British education system.",
      "At Mug.Up, we support international families in exploring suitable British boarding schools, understanding entry requirements, and preparing students academically and linguistically for each stage of the admissions process.",
    ],
    ctas: [{ label: "Book an Initial Consultation and Assessment", href: "/book-assessment" }],
  },
  sections: [
    {
      id: "at-a-glance",
      title: "At a Glance",
      blocks: [
        {
          type: "list",
          items: [
            "Students: International students aged 8–18",
            "Entry Points: Prep School · Senior School · Sixth Form",
            "Destination: UK Boarding Schools",
            "Delivery: Online worldwide · In person in the UK",
            "Initial Assessment: Paid consultation and academic assessment",
          ],
        },
      ],
    },
    {
      id: "how-we-support",
      title: "How We Support Your Child",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "School Selection",
              body: "Identify and explore schools that may be suitable for your child's age, academic profile, interests, ambitions and preferred educational pathway.",
            },
            {
              title: "Entry Requirements",
              body: "Understand individual school requirements, admissions timelines, academic expectations and the qualifications or assessments required for entry.",
            },
            {
              title: "Entrance Exam Preparation",
              body: "Prepare for relevant entrance assessments through targeted academic support and exam practice. Depending on the school, this may include English, Mathematics, verbal and non-verbal reasoning, school-specific assessments and interview tasks.",
            },
            {
              title: "English & Academic Preparation",
              body: "Strengthen the English-language and academic skills needed to enter and succeed in a British boarding school environment.",
            },
            {
              title: "Interview Preparation",
              body: "Build confidence and communication skills for school interviews through structured preparation and realistic practice.",
            },
            {
              title: "Application Guidance",
              body: "Help families understand application stages, required documents, admissions timelines and preparation priorities.",
            },
            {
              title: "Transition Preparation",
              body: "Support students in understanding academic expectations, communication, independence and day-to-day life within a British boarding school environment.",
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
            "A clearer understanding of potentially suitable British boarding school options.",
            "Stronger preparation for entrance assessments and interviews.",
            "Greater confidence in English-language and academic requirements.",
            "A structured pathway towards the chosen school and entry point.",
            "Better preparation for the transition into British boarding education.",
          ],
        },
      ],
    },
    {
      id: "beyond-admission",
      title: "Beyond School Admission",
      intro:
        "A pathway built around the future: choosing the right boarding school is not only about gaining admission. It is about finding an educational environment that supports your child's longer-term goals.",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "GCSE & A-Level Pathways",
              body: "Consider subject choices and academic pathways that support future ambitions.",
            },
            {
              title: "University Preparation",
              body: "Build a strong academic foundation for future university applications in the UK or internationally.",
            },
            {
              title: "Academic & Personal Development",
              body: "Develop independence, confidence, communication and the skills needed to thrive in a new educational environment.",
            },
            {
              title: "International Opportunities",
              body: "Create a strong foundation for further education and future opportunities in the UK and beyond.",
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
          body: "Every child and every boarding school journey is different. Our paid initial consultation and assessment helps us understand your child's academic profile, English level, interests, future goals and preferred entry point so we can recommend the most appropriate next steps.",
          note: "Mug.Up provides educational guidance, academic preparation and admissions support. Where regulated immigration or legal advice is required, families should consult an appropriately authorised adviser.",
          cta: { label: "Book an Initial Consultation and Assessment", href: "/book-assessment" },
        },
      ],
    },
  ],
};
