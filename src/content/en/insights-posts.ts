import type { InsightPost } from "@/content/types";

// Sample posts — placeholder-quality content, labelled as sample in the UI
// and noindexed. Replaced with real client articles before launch.
export const posts: InsightPost[] = [
  {
    slug: "choosing-between-ielts-and-cambridge",
    title: "Choosing Between IELTS and Cambridge English: Which Exam Is Right for You?",
    description:
      "A practical comparison of IELTS and Cambridge English qualifications — how they differ, who accepts them, and how to decide which one matches your goals.",
    category: "english-qualifications",
    date: "2026-08-01",
    sample: true,
    body: [
      {
        type: "lead",
        text: "IELTS and Cambridge English are two of the most widely recognised English qualifications in the world. Both can open doors to study, work and visas — but they suit different goals, timelines and learning styles.",
      },
      {
        type: "paragraph",
        text: "IELTS is usually the right choice when you need a score for a specific purpose within a fixed timeframe: a university application, professional registration, or a UK visa. Results are reported on a band scale and are generally valid for two years.",
      },
      {
        type: "paragraph",
        text: "Cambridge English qualifications, such as B2 First and C1 Advanced, work differently: you pass at a level, and the certificate does not expire. They reward steady, long-term progress and are a strong choice for learners building credentials for the future.",
      },
      {
        type: "list",
        items: [
          "Choose IELTS if you need a result for a university, employer or UKVI application with a clear deadline.",
          "Choose Cambridge English if you want a certificate that proves your level and never expires.",
          "Consider the format you prefer — computer or paper, a single sitting or staged preparation.",
          "Whichever you choose, an assessment of your current level first will save you weeks of misdirected preparation.",
        ],
      },
      {
        type: "paragraph",
        text: "Still unsure? A short assessment with a tutor will identify your current level and recommend the exam — and the preparation route — that best fits your goals.",
      },
    ],
  },
  {
    slug: "uk-school-system-parents-guide",
    title: "The UK School System: A Parent's Guide to Key Stages and Exams",
    description:
      "An introduction to the UK school system for parents new to Britain — key stages, SATs, the 11+, GCSEs and the choices that shape your child's pathway.",
    category: "uk-education",
    date: "2026-08-05",
    sample: true,
    body: [
      {
        type: "lead",
        text: "Moving your child into the UK school system can feel overwhelming — new year groups, unfamiliar exams and decisions that seem to arrive all at once. This guide walks you through the essentials.",
      },
      {
        type: "paragraph",
        text: "Education in England is organised into key stages. Primary school covers Key Stages 1 and 2 (ages 5–11) and ends with SATs, while secondary school covers Key Stages 3 and 4 and leads to GCSE examinations at age 16.",
      },
      {
        type: "paragraph",
        text: "In some regions, the 11+ examination decides entry to selective grammar schools at the end of primary school. After GCSEs, students choose a post-16 route: A-Levels, T-Levels, BTEC qualifications or an apprenticeship.",
      },
      {
        type: "list",
        items: [
          "Ages 5–11: primary school, ending with Key Stage 2 SATs.",
          "Ages 10–11: the optional 11+ exam for selective grammar schools.",
          "Ages 11–16: secondary school, ending with GCSEs.",
          "Ages 16–18: A-Levels, T-Levels, BTEC or an apprenticeship.",
          "Age 18: university applications through UCAS.",
        ],
      },
      {
        type: "paragraph",
        text: "The most important thing parents can do is plan ahead: knowing which exams are on the horizon 12–18 months in advance gives your child time to prepare calmly and confidently.",
      },
    ],
  },
];
