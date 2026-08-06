import type { Page } from "@/content/types";

// Copy source: client doc "GLOBAL INTEGRATION.docx", hero part (verbatim where provided).
// Stage 1: hero landing only — the three pathway cards have no hrefs until the
// full Global Integration track ships in Stage 2. Modern Languages links to mugup.com.ua.
export const page: Page = {
  meta: {
    title: "Global Integration | Mug.Up",
    description:
      "Build your future through language with Mug.Up Global — integration, professional English and business communication programmes for life and work in the UK.",
  },
  hero: {
    title: "Global Integration",
    subtitle: "Your Goals. Your Journey. Our Support.",
    body: [
      "Build Your Future Through Language. Turning Languages into Opportunities.",
      "Moving to a new country is about more than learning a language. It’s about building confidence, creating opportunities, and achieving your personal and professional goals.",
      "At Mug.Up Global, we help individuals and families develop the language, communication, and professional skills they need to succeed in everyday life, advance their careers, and unlock new opportunities in the UK and beyond.",
      "Whether you’re settling into life in the UK, improving your workplace communication, building your career, or learning a new language, we’re here to support every step of your journey.",
    ],
    ctas: [{ label: "Book Your Assessment", href: "/book-assessment" }],
  },
  sections: [
    {
      id: "your-global-journey",
      title: "Your Global Journey",
      intro:
        "Every journey begins with a goal. Choose the pathway that best matches your ambitions and let us help you move forward with confidence.",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              eyebrow: "Life in the UK",
              title: "Community Integration Programme",
              body: "Feel confident in everyday life in Britain. Develop the practical language and communication skills you need to navigate healthcare, schools, local services, and everyday conversations while becoming part of your community.",
              image: "placeholder",
            },
            {
              eyebrow: "Career Development",
              title: "Professional English Pathway",
              body: "Build the communication skills employers value. Whether you’re looking for your first job, changing careers, or progressing professionally, we’ll help you communicate with confidence in the British workplace.",
              image: "placeholder",
            },
            {
              eyebrow: "Business Communication",
              title: "Business English & Workplace Communication",
              body: "Communicate professionally in today’s workplace. Develop the skills needed for meetings, presentations, emails, negotiations, teamwork, and professional communication in British and international organisations.",
              image: "placeholder",
            },
            {
              eyebrow: "Modern Languages",
              title: "Learn a Language. Expand Your Opportunities.",
              body: "Languages create opportunities for international careers, travel, education, and personal growth. Choose from a range of modern language programmes designed to help you communicate confidently in real-world situations.",
              items: ["English", "Spanish", "French", "German", "Italian", "Ukrainian"],
              image: "placeholder",
              href: "https://mugup.com.ua",
              linkLabel: "Explore Languages",
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
          title: "Start with the Right Guidance",
          body: "Every learner’s journey is unique. Our personalised assessment helps us understand your current level, future ambitions, and learning goals before recommending the programme that’s right for you. Whether you’re building confidence in everyday communication, developing professional English, or learning a new language, we’ll help you take the next step with confidence.",
          cta: { label: "Book Your Assessment", href: "/book-assessment" },
        },
      ],
    },
  ],
};
