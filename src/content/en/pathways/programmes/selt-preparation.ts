import type { ProgrammePage } from "@/content/types";

// Copy source: client doc "British Education Pathways.docx", Page 9 (verbatim where provided).
export const page: ProgrammePage = {
  slug: "selt-preparation",
  group: "english-qualifications",
  cardTitle: "SELT Preparation",
  cardBlurb:
    "UKVI-approved LanguageCert SELT preparation for UK visa, settlement, and citizenship applications.",
  meta: {
    title: "SELT Preparation | Mug.Up",
    description:
      "Prepare for your UKVI-approved SELT exam with Mug.Up, an official LanguageCert Partner — choose the right qualification and pass your UK visa English test.",
  },
  hero: {
    title: "SELT Preparation",
    subtitle: "Preparing You for Your UK Visa English Test",
    body: [
      "A Secure English Language Test (SELT) is required for many UK visa, settlement, and citizenship applications.",
      "As an official LanguageCert Partner, Mug.Up prepares learners for SELT examinations approved by UK Visas and Immigration (UKVI). We help you choose the right qualification, understand the requirements, and approach your test with confidence.",
    ],
    ctas: [{ label: "Book Your Assessment", href: "/book-assessment" }],
  },
  atAGlance: [
    { label: "Level", value: "A1–C1" },
    { label: "Recommended Age", value: "16+" },
    { label: "Format", value: "Online & In Person" },
    { label: "Assessment", value: "Included" },
  ],
  sections: [
    {
      id: "why-choose",
      title: "Why Choose SELT Preparation?",
      intro: "Preparing for a SELT exam is about more than passing a test.",
      blocks: [
        {
          type: "paragraph",
          text: "Choosing the correct qualification, understanding UKVI requirements, and feeling confident on the day are all essential parts of a successful visa application.",
        },
        {
          type: "paragraph",
          text: "As an official LanguageCert Partner, we provide trusted guidance and personalised preparation every step of the way.",
        },
      ],
    },
    {
      id: "what-we-cover",
      title: "What We Cover",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "Choosing the Right SELT Qualification",
              body: "Guidance on selecting the correct LanguageCert SELT examination for your visa or immigration route.",
            },
            {
              title: "Speaking & Listening Skills",
              body: "Develop the practical communication skills assessed during the examination.",
            },
            {
              title: "Official Exam Preparation",
              body: "Become familiar with the test format, assessment criteria, and what to expect on exam day.",
            },
            {
              title: "Mock Practice & Personalised Feedback",
              body: "Build confidence through realistic practice sessions and individual feedback from experienced tutors.",
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
            "Confidence approaching your SELT examination.",
            "A clear understanding of the LanguageCert exam format and UKVI requirements.",
            "Stronger practical English communication skills.",
            "The best possible preparation for a successful SELT result.",
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
          body: "Every visa application is different. Our personalised assessment helps us understand your visa requirements, recommend the correct SELT qualification, and create a preparation plan tailored to your individual needs and timeline.",
          cta: { label: "Book Your Assessment", href: "/book-assessment" },
        },
      ],
    },
  ],
};
