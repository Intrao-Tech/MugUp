import type { Page } from "@/content/types";

// Copy source: client doc "Global integration updated v2" (docs/global-integration-updated-v2.docx),
// verbatim. Replaces the Stage 1 hero-only landing.
// Language cards link to /pathways/global-integration/<slug> sub-pages
// (global-integration-languages.ts); the UK card links to British Education.
// "Explore Our Integration Network" goes to the network stub page;
// "Become an Integration Partner" and "Discuss an Organisational Programme"
// point to /contact (its Subject select covers Partnership) until dedicated
// forms exist.
export const page: Page = {
  meta: {
    title: "Global Integration | Mug.Up",
    description:
      "Personalised language programmes built around your goals — relocation, career, study, business or personal learning — with Mug.Up Global.",
  },
  hero: {
    title: "Global Integration",
    subtitle: "Learn the Language. Understand the Country. Build Your Future.",
    body: [
      "Language can open a new country, a new career, a new qualification — or simply a new way to connect with the world.",
      "At Mug.Up Global, we create personalised language programmes built around your goals — whether you are preparing to relocate, develop your career, study, grow your business or learn for personal reasons.",
      "We combine language learning with the cultural and practical understanding you need to communicate confidently in the real world.",
    ],
    ctas: [
      { label: "Book Your Language Assessment", href: "/book-assessment" },
      {
        label: "Explore Languages & Destinations",
        href: "/pathways/global-integration#explore-languages-destinations",
      },
    ],
  },
  sections: [
    {
      id: "start-with-your-goal",
      eyebrow: "Start With Your Goal",
      title: "What Do You Want Language to Help You Achieve?",
      intro: "Not sure which programme is right for you? Start with what you want to achieve.",
      blocks: [
        {
          type: "cards",
          cards: [
            { title: "LIVE", body: "Relocation & everyday life" },
            { title: "WORK", body: "Career & workplace communication" },
            { title: "GROW", body: "Business & professional communication" },
            { title: "STUDY", body: "Education & qualifications" },
            { title: "CONNECT", body: "Travel, family & personal development" },
          ],
        },
        {
          type: "paragraph",
          text: "We will help you identify the language, level and learning pathway that fits your goals.",
        },
      ],
    },
    {
      id: "explore-languages-destinations",
      eyebrow: "Explore Languages & Destinations",
      title: "Where Could Language Take You?",
      intro:
        "Choose the language you want to learn — or start with the country connected to your plans.",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "United Kingdom · English",
              body: "Everyday English • Relocation & Integration • Workplace English • Business English • Academic English • English for Children & Young People • British Workplace & Communication Culture",
              items: [
                "English for Specific Purposes: Accounting & Finance • Healthcare • Education • Hospitality • Law • Customer Service • IT",
                "Qualifications: IELTS Academic • IELTS General Training • IELTS for UKVI • LanguageCert • Cambridge English Qualifications • ESOL Skills for Life • Functional Skills English",
              ],
              href: "/pathways/british-education",
              linkLabel: "Explore English & UK Pathways",
            },
            {
              title: "Spain · Spanish",
              body: "Everyday Spanish • Relocation & Integration • Workplace Spanish • Business Spanish • Academic Spanish • Travel • Industry-Specific Spanish • Culture & Communication",
              items: ["Qualifications: DELE • SIELE"],
              href: "/pathways/global-integration/spanish",
              linkLabel: "Explore Spanish & Spain",
            },
            {
              title: "France · French",
              body: "Everyday French • Relocation & Integration • Workplace French • Business French • Academic French • Travel • Industry-Specific French • Culture & Communication",
              items: ["Qualifications: DELF • DALF • TCF"],
              href: "/pathways/global-integration/french",
              linkLabel: "Explore French & France",
            },
            {
              title: "Germany · German",
              body: "Everyday German • Relocation & Integration • Workplace German • Business German • Academic German • Travel • Industry-Specific German • Culture & Communication",
              items: ["Qualifications: Goethe-Zertifikat • telc Deutsch • TestDaF"],
              href: "/pathways/global-integration/german",
              linkLabel: "Explore German & Germany",
            },
            {
              title: "Italy · Italian",
              body: "Everyday Italian • Relocation & Integration • Workplace Italian • Business Italian • Academic Italian • Travel • Industry-Specific Italian • Culture & Communication",
              items: ["Qualifications: CILS • CELI • PLIDA"],
              href: "/pathways/global-integration/italian",
              linkLabel: "Explore Italian & Italy",
            },
            {
              title: "Portugal · Portuguese",
              body: "Everyday Portuguese • Relocation & Integration • Workplace Portuguese • Business Portuguese • Academic Portuguese • Travel • Industry-Specific Portuguese • Culture & Communication",
              items: ["Qualifications: CAPLE"],
              href: "/pathways/global-integration/portuguese",
              linkLabel: "Explore Portuguese & Portugal",
            },
            {
              title: "Ukraine · Ukrainian",
              body: "Beginners • Everyday Ukrainian • Partners & Families • Heritage Learners • Children & Young People • Professional & Cultural Communication • Ukrainian Culture",
              href: "/pathways/global-integration/ukrainian",
              linkLabel: "Explore Ukrainian",
            },
          ],
        },
      ],
    },
    {
      id: "how-it-works",
      eyebrow: "How It Works",
      title: "Your Learning Journey",
      blocks: [
        {
          type: "steps",
          steps: [
            {
              title: "Assessment",
              body: "We explore your current language level, goals, destination and communication needs.",
            },
            {
              title: "Personalised Plan",
              body: "We recommend the most suitable programme, level, format and learning priorities.",
            },
            {
              title: "Learn",
              body: "Develop practical language with experienced tutors through authentic materials, real-world scenarios and personalised feedback.",
            },
            {
              title: "Progress",
              body: "Regular reviews help you track your development and keep your learning focused on your goals.",
            },
          ],
        },
        {
          type: "buttons",
          ctas: [{ label: "Book Your Language Assessment", href: "/book-assessment" }],
        },
      ],
    },
    {
      id: "why-mugup-global",
      eyebrow: "Why Mug.Up Global?",
      title: "More Than Learning a Language.",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "Learning built around your goals",
              body: "Your programme reflects your level, destination and what you want to achieve.",
            },
            {
              title: "Language in context",
              body: "Understand not only what to say, but how people actually communicate.",
            },
            {
              title: "Professional & academic pathways",
              body: "From everyday communication to industry-specific language and recognised qualifications.",
            },
            {
              title: "Cultural understanding",
              body: "Develop the confidence to communicate effectively across different cultural and professional environments.",
            },
            {
              title: "Multiple languages. Multiple destinations.",
              body: "Learn for where you are now — or where you want to go next.",
            },
            {
              title: "Flexible learning",
              body: "Study online or in person with experienced tutors and regular progress reviews.",
            },
          ],
        },
      ],
    },
    {
      id: "beyond-language",
      eyebrow: "Beyond Language",
      title: "Language Helps You Communicate. The Right Support Helps You Move Forward.",
      blocks: [
        {
          type: "lead",
          text: "Language learning can be only one part of an international journey.",
        },
        {
          type: "paragraph",
          text: "We are building a network of trusted education providers, professional organisations and appropriately qualified specialists to help learners access reliable, country-specific information and independent support.",
        },
        {
          type: "paragraph",
          text: "Our growing network spans education and qualifications, employment and professional development, business and community networks, relocation and settlement support.",
        },
        {
          type: "paragraph",
          text: "Services provided by external partners remain independent from Mug.Up and are subject to each partner's own professional responsibilities, terms and regulatory requirements.",
        },
        {
          type: "buttons",
          ctas: [
            {
              label: "Explore Our Integration Network",
              href: "/pathways/global-integration/network",
            },
            { label: "Become an Integration Partner", href: "/contact" },
          ],
        },
      ],
    },
    {
      id: "for-employers-organisations",
      eyebrow: "For Employers & Organisations",
      title: "Language and Communication for International Teams.",
      blocks: [
        {
          type: "paragraph",
          text: "We develop tailored programmes for businesses, education providers and organisations working with international employees, learners and communities.",
        },
        {
          type: "paragraph",
          text: "Programmes can include language assessment, workplace and industry-specific communication, intercultural communication and structured progress reporting.",
        },
        {
          type: "buttons",
          ctas: [{ label: "Discuss an Organisational Programme", href: "/contact" }],
        },
      ],
    },
    {
      id: "international-language-qualifications",
      eyebrow: "Tests for Global Opportunities",
      title: "International Language Tests",
      intro:
        "Preparation for internationally recognised language tests for study, work, migration and international mobility. Ages 6–19.",
      blocks: [
        {
          type: "paragraph",
          text: "IELTS · Cambridge English · LanguageCert · DELE · SIELE · DELF · DALF · TCF · Goethe-Zertifikat · telc Deutsch · TestDaF · CILS · CELI · PLIDA · CAPLE",
        },
        {
          type: "buttons",
          ctas: [
            {
              label: "Explore International Language Tests",
              href: "/pathways/global-integration/qualifications",
            },
          ],
        },
      ],
    },
    {
      id: "international-education",
      title: "International Education & Study Abroad",
      intro:
        "Supporting international learners and families as they explore globally recognised education pathways, international schools and study opportunities in the UK and beyond.",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "International Baccalaureate (IB)",
              eyebrow: "Ages 3–19",
              body: "Personalised academic support for learners studying within the International Baccalaureate continuum, from the early years through to university preparation.",
              items: ["PYP", "MYP", "Diploma Programme", "Career-related Programme"],
            },
            {
              title: "British Boarding Schools for International Students",
              eyebrow: "A British Education with Global Opportunities",
              body: "Guidance and academic preparation for international families considering boarding education in the UK, from exploring school options and understanding entry requirements to preparing for admissions, interviews and the transition into British education.",
              href: "/pathways/global-integration/boarding-schools",
              linkLabel: "Explore British Boarding Schools",
            },
          ],
        },
      ],
    },
    {
      id: "final-cta",
      title: "Your Language. Your Destination. Your Future.",
      blocks: [
        {
          type: "paragraph",
          text: "You may be preparing for a move, a new career, further study, an international business opportunity — or simply learning something new.",
        },
        {
          type: "paragraph",
          text: "You don't need to know exactly which programme you need.",
        },
        {
          type: "lead",
          text: "Start with an assessment. We'll help you find the right pathway.",
        },
        {
          type: "buttons",
          ctas: [
            { label: "Book Your Language Assessment", href: "/book-assessment" },
            { label: "Contact Our Team", href: "/contact" },
          ],
        },
      ],
    },
  ],
};
