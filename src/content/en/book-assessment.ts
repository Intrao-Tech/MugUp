import type { FormPage } from "@/content/types";

// Copy source: client doc "BOOK_YOUR_ASSESSMENT.docx" (verbatim where provided).
export const page: FormPage = {
  meta: {
    title: "Get Expert Guidance | Mug.Up",
    description:
      "Talk to Mug.Up Language Studio about your goals. Free expert guidance, an optional assessment and a clear learning pathway — with no obligation to enrol.",
  },
  hero: {
    eyebrow: "Start with the Right Guidance",
    title: "Get Expert Guidance",
    subtitle: "Every successful journey begins with understanding where you are today.",
    body: [
      "Choosing the right educational or language pathway can feel overwhelming. Every learner has different goals, experience, strengths, and ambitions.",
      "Our personalised assessment helps us understand your current level and recommend the programme that best supports your future success.",
      "Whether you're looking for educational guidance, language development, career progression, or support settling into life in the UK, we're here to help you take the right first step.",
    ],
  },
  sections: [
    {
      id: "who-it-is-for",
      title: "Who Is It For?",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "Parents",
              body: "Looking for the best educational pathway for your child.",
            },
            {
              title: "Students",
              body: "Preparing for GCSEs, A Levels, university, or English qualifications.",
            },
            {
              title: "Adults",
              body: "Building confidence in English for everyday life, work, or further study.",
            },
            {
              title: "Professionals",
              body: "Developing workplace communication skills or preparing for career progression.",
            },
            {
              title: "Newcomers to the UK",
              body: "Looking for practical language support and guidance for life in Britain.",
            },
          ],
        },
      ],
    },
    {
      id: "how-it-works",
      title: "How It Works",
      intro: "Your Journey in Five Simple Steps",
      blocks: [
        {
          type: "steps",
          steps: [
            {
              title: "Get Expert Guidance",
              body: "Choose a convenient date and time.",
            },
            {
              title: "Meet with Our Team",
              body: "One of our experienced educators will discuss your goals, experience, and learning needs.",
            },
            {
              title: "Complete Your Assessment",
              body: "Identify your current level, strengths and areas for development.",
            },
            {
              title: "Receive Your Personalised Plan",
              body: "We'll recommend the programme that best matches your objectives and explain the next steps.",
            },
            {
              title: "Begin Your Journey",
              body: "Start learning with confidence, knowing you've chosen the right pathway.",
            },
          ],
        },
      ],
    },
    {
      id: "faq",
      title: "Frequently Asked Questions",
      blocks: [
        {
          type: "faq",
          items: [
            {
              question: "Is Expert Guidance free?",
              answer:
                "Yes. Your initial conversation with our team is free and there is no obligation to enrol. It gives us an opportunity to understand your goals and recommend the most suitable next step.",
            },
            {
              question: "What happens during the Expert Guidance call?",
              answer:
                "We'll discuss your goals, current needs, previous learning experience and what you would like to achieve. Our team will explain the options available and advise you on the most appropriate next step.",
            },
            {
              question: "Will I need an assessment?",
              answer:
                "Not always. An assessment may be recommended where we need a clearer understanding of your current language or academic level before creating your personalised learning plan.",
            },
            {
              question: "How much does the assessment cost?",
              answer:
                "The assessment costs £15 and is paid in advance. If you continue learning with Mug.Up, the full £15 will be credited towards your first booking.",
            },
            {
              question: "What happens after the assessment?",
              answer:
                "We'll use the results alongside your goals and learning needs to recommend the most suitable programme, level, format and learning priorities.",
            },
            {
              question: "Do I have to enrol after receiving my recommendations?",
              answer:
                "No. There is no obligation to enrol. You can review our recommendations and decide whether you would like to continue learning with Mug.Up.",
            },
          ],
        },
      ],
    },
  ],
  form: {
    title: "Get Expert Guidance",
    intro:
      "Complete the form below and we will get back to you to arrange a convenient date and time.",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email", required: true },
      { name: "phone", label: "WhatsApp Phone Number", type: "tel" },
      {
        name: "whoFor",
        label: "Who is the assessment for?",
        type: "select",
        required: true,
        options: ["My child", "Myself", "Someone else"],
      },
      {
        name: "pathwayInterest",
        label: "What would you like support with?",
        type: "select",
        options: [
          "British Education",
          "English & UK Qualifications",
          "Languages & Global Integration",
          "International Education",
          "Not sure — I'd like guidance",
        ],
      },
      {
        name: "source",
        label: "How did you hear about us?",
        type: "select",
        options: [
          "Google Search",
          "Instagram",
          "Facebook",
          "TikTok",
          "Telegram",
          "Recommendation from friends or family",
          "Event",
          "Flyer",
          "School",
          "Partner organisation",
          "Facebook group",
          "Other",
        ],
      },
      {
        name: "message",
        label: "Your Message",
        type: "textarea",
        hint: "Tell us briefly about your goals, or ask us anything.",
      },
      {
        name: "attachment",
        label: "Supporting Documents",
        type: "file",
        hint: "Optional — for example, recent school reports or exam results.",
      },
      {
        name: "consent",
        label:
          "I consent to Mug.Up Language Studio storing and processing my personal data in accordance with the Privacy Policy. I also agree to receive relevant information about Mug.Up programmes, services, events and special offers.",
        type: "checkbox",
        required: true,
      },
    ],
    submitLabel: "Get Expert Guidance",
    disabledNote:
      "The form backend is not connected yet — submissions are disabled at this stage.",
  },
};
