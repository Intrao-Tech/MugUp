import type { ProgrammePage } from "@/content/types";

// Copy source: client doc "LanguageCert pagе.docx" (20 Aug 2026, verbatim where provided).
export const page: ProgrammePage = {
  slug: "languagecert",
  group: "international-qualifications",
  cardTitle: "LanguageCert",
  cardBlurb:
    "Official LanguageCert Registration Centre — internationally recognised English qualifications for study, work and life, including SELT.",
  meta: {
    title: "LanguageCert Exams & Registration | Mug.Up",
    description:
      "Register for LanguageCert exams with Mug.Up, an official LanguageCert Registration Centre: International ESOL, Academic, General, LTE and SELT — online or at a test centre.",
  },
  hero: {
    title: "LanguageCert",
    subtitle: "International English Qualifications for Study, Work and Life",
    body: [
      "Gain a recognised English language qualification for education, employment, career development or international opportunities.",
      "Mug.Up Studio is an official LanguageCert Registration Centre, providing guidance and registration support for a range of LanguageCert examinations.",
    ],
    ctas: [{ label: "Book an Assessment", href: "/book-assessment" }],
  },
  atAGlance: [
    { label: "Levels", value: "CEFR A1–C2" },
    { label: "Format", value: "Online & Test Centre" },
    { label: "Recognition", value: "Ofqual-regulated (International ESOL)" },
    { label: "Registration", value: "Supported by Mug.Up" },
  ],
  sections: [
    {
      id: "exams-available",
      title: "LanguageCert Exams Available Through Mug.Up",
      intro:
        "Choose from a range of English language qualifications depending on your goals, required level and intended use.",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "LanguageCert International ESOL",
              body: "International English qualifications covering all four language skills and available across CEFR levels A1–C2. Written and Spoken exams can be taken separately, giving candidates flexibility in how they certify their English language skills.",
              items: ["Written Exam — Listening • Reading • Writing", "Spoken Exam — Speaking"],
            },
            {
              title: "LanguageCert Academic",
              body: "An English language qualification designed for candidates who need to demonstrate their English proficiency for academic and educational purposes.",
            },
            {
              title: "LanguageCert General",
              body: "A flexible English language qualification for candidates who need to demonstrate their English proficiency for general, educational or professional purposes.",
            },
            {
              title: "LanguageCert Test of English (LTE)",
              body: "A multi-level English language assessment covering CEFR levels A1–C2, suitable for candidates who need evidence of their English level for general, academic or professional purposes.",
            },
            {
              title: "LanguageCert SELT",
              body: "LanguageCert Secure English Language Tests (SELT) are available for candidates who need an approved English language test for specific UK purposes.",
              items: [
                "LanguageCert ESOL SELT",
                "LanguageCert Academic SELT",
                "LanguageCert General SELT",
              ],
            },
          ],
        },
        {
          type: "paragraph",
          text: "Mug.Up Language Studio is an official LanguageCert SELT Examinations Registration Centre. If you are unsure which qualification you need, we can help you understand the available options before you register.",
        },
      ],
    },
    {
      id: "flexible-online-exams",
      title: "Flexible Online Exams",
      intro:
        "Selected LanguageCert examinations can be taken online with live remote invigilation, allowing candidates to take their exam from a suitable quiet location without travelling to a test centre.",
      blocks: [
        {
          type: "paragraph",
          text: "All you need is a computer, webcam, reliable internet connection and a quiet room. A trained invigilator is present online throughout the process to guide you and ensure appropriate exam conditions.",
        },
        {
          type: "cards",
          cards: [
            {
              title: "Flexible Scheduling",
              body: "Choose an exam time that works around your schedule.",
            },
            {
              title: "Take Your Exam Remotely",
              body: "Eligible examinations can be taken from home or another suitable private location.",
            },
            {
              title: "Live Invigilation",
              body: "A trained invigilator supports and monitors the examination remotely.",
            },
            {
              title: "Recognised Qualification",
              body: "Online delivery provides the same qualification and international recognition as the equivalent examination delivered at an approved test centre.",
            },
          ],
        },
      ],
    },
    {
      id: "what-for",
      title: "What Can LanguageCert Be Used For?",
      intro:
        "Depending on the qualification you choose and the requirements of the organisation you are applying to, LanguageCert qualifications can be used to demonstrate English language proficiency for:",
      blocks: [
        {
          type: "list",
          items: [
            "University and education applications",
            "Employment requirements",
            "Career progression",
            "Professional development",
            "Monitoring your English language progress",
          ],
        },
        {
          type: "paragraph",
          text: "LanguageCert International ESOL qualifications from A1 to C2 are regulated by Ofqual in England.",
        },
        {
          type: "paragraph",
          text: "Requirements vary between universities, employers and other organisations, so candidates should always check which qualification and level are required for their specific purpose.",
        },
      ],
    },
    {
      id: "how-it-works",
      title: "How It Works",
      blocks: [
        {
          type: "steps",
          steps: [
            {
              title: "Tell Us What You Need the Qualification For",
              body: "Study, work, professional development or another requirement.",
            },
            {
              title: "Choose Your Exam",
              body: "We help you understand the available LanguageCert qualifications and identify the option relevant to your goal.",
            },
            {
              title: "Register",
              body: "Complete your LanguageCert exam registration with support from Mug.Up.",
            },
            {
              title: "Take Your Exam",
              body: "Depending on the qualification, your examination may be available online with live remote invigilation or through an approved test centre.",
            },
          ],
        },
      ],
    },
    {
      id: "final-cta",
      blocks: [
        {
          type: "cta",
          title: "Not Sure Which LanguageCert Exam You Need?",
          body: "Choosing the right qualification depends on why you need to prove your English, the level required and the organisation requesting it. Tell us your goal and we'll help you understand the available LanguageCert options and guide you through the registration process.",
          cta: { label: "Contact Us", href: "/contact" },
        },
      ],
    },
  ],
};
