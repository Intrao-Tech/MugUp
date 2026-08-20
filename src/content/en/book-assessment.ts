import type { FormPage } from "@/content/types";

// Copy source: client doc "BOOK_YOUR_ASSESSMENT.docx" (verbatim where provided).
export const page: FormPage = {
  meta: {
    title: "Book an Assessment | Mug.Up",
    description:
      "Book a free personalised assessment at Mug.Up Language Studio. Discuss your goals, review your level and leave with a clear learning pathway — no obligation.",
  },
  hero: {
    eyebrow: "Start with the Right Guidance",
    title: "Book an Assessment",
    subtitle: "Every successful journey begins with understanding where you are today.",
    body: [
      "Choosing the right educational or language pathway can feel overwhelming. Every learner has different goals, experience, strengths, and ambitions.",
      "Our personalised assessment helps us understand your current level and recommend the programme that best supports your future success.",
      "Whether you're looking for educational guidance, language development, career progression, or support settling into life in the UK, we're here to help you take the right first step.",
    ],
  },
  sections: [
    {
      id: "why-assessment-matters",
      title: "Why an Assessment Matters",
      intro: "A personalised approach delivers better results.",
      blocks: [
        {
          type: "paragraph",
          text: "We don't believe in one-size-fits-all programmes. Every assessment is designed to help us understand your individual needs before recommending the most appropriate learning pathway.",
        },
        {
          type: "paragraph",
          text: "Our goal isn't simply to place you on a course—it's to help you achieve meaningful, long-term success.",
        },
      ],
    },
    {
      id: "what-it-includes",
      title: "What Your Assessment Includes",
      intro: "Every assessment is personalised and may include:",
      blocks: [
        {
          type: "list",
          items: [
            "Discussion of your goals and future plans",
            "Review of your current language or academic level",
            "Identification of strengths and areas for development",
            "Personalised programme recommendations",
            "Suggested learning pathway",
            "Opportunity to ask questions",
            "Clear next steps",
          ],
        },
      ],
    },
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
      id: "why-choose",
      title: "Why Families and Learners Choose Mug.Up Assessments",
      blocks: [
        {
          type: "list",
          items: [
            "Personalised guidance – Recommendations tailored to your goals.",
            "Experienced educators – Advice from specialists in UK education and language learning.",
            "Clear next steps – Leave with a structured plan, not just a course recommendation.",
            "No obligation to enrol – Take the time to make the decision that's right for you.",
          ],
        },
      ],
    },
    {
      id: "how-it-works",
      title: "How It Works",
      intro: "Your Journey in Four Simple Steps",
      blocks: [
        {
          type: "steps",
          steps: [
            {
              title: "Book an Assessment",
              body: "Choose a convenient date and time.",
            },
            {
              title: "Meet with Our Team",
              body: "One of our experienced educators will discuss your goals, experience, and learning needs.",
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
              question: "How much does the assessment cost?",
              answer:
                "The assessment is offered on separate terms — we will confirm the details when you book. It comes with no obligation to enrol on any programme.",
            },
            {
              question: "How long does the assessment take?",
              answer:
                "Most assessments take around 30–45 minutes, depending on your goals and the level review involved.",
            },
            {
              question: "Is the assessment online or in person?",
              answer:
                "Whichever suits you best — we offer assessments online or in person at our learning centre in Bedford.",
            },
            {
              question: "Do I need to bring or prepare anything?",
              answer:
                "No preparation is required. If you have recent school reports, exam results, or previous certificates, they can help us build a fuller picture, but they are entirely optional.",
            },
            {
              question: "Am I committing to a course by booking?",
              answer:
                "Not at all. After the assessment you receive personalised recommendations and clear next steps — the decision about what to do next is always yours.",
            },
          ],
        },
      ],
    },
  ],
  form: {
    title: "Book an Assessment",
    intro:
      "Complete the form below and we will get back to you to arrange a convenient date and time.",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email", required: true },
      { name: "phone", label: "Phone Number", type: "tel" },
      {
        name: "whoFor",
        label: "Who is the assessment for?",
        type: "select",
        required: true,
        options: [
          "Parent — for my child",
          "Student",
          "Adult learner",
          "Professional",
          "Newcomer to the UK",
        ],
      },
      {
        name: "pathwayInterest",
        label: "Which pathway are you interested in?",
        type: "select",
        options: [
          "British Education",
          "English Qualifications",
          "Global Integration",
          "Not sure yet",
        ],
      },
      {
        name: "preferredFormat",
        label: "Preferred format",
        type: "select",
        options: ["Online", "In person (Bedford)", "No preference"],
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
          "I consent to Mug.Up Language Studio storing and processing the information provided in this form in order to respond to my enquiry, in line with the Privacy Policy.",
        type: "checkbox",
        required: true,
      },
    ],
    submitLabel: "Book an Assessment",
    disabledNote:
      "The form backend is not connected yet — submissions are disabled at this stage.",
  },
};
