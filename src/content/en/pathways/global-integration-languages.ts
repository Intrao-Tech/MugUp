import type { LanguagePage } from "@/content/types";

// Global Integration language sub-pages ("Explore Spanish & Spain" etc. on the
// landing). Programme strands and qualifications come verbatim from the client
// doc "Global integration updated v2" (docs/global-integration-updated-v2.docx);
// the client has not provided further copy yet, so each page is the doc content
// plus the standard assessment CTA. English/UK is covered by British Education.
export const pages: LanguagePage[] = [
  {
    slug: "spanish",
    cardTitle: "Spain · Spanish",
    meta: {
      title: "Spanish & Spain | Mug.Up",
      description:
        "Everyday, workplace, business and academic Spanish, travel and industry-specific Spanish, plus DELE and SIELE preparation with Mug.Up Global.",
    },
    hero: { title: "Spain · Spanish" },
    sections: [
      {
        id: "programmes",
        title: "Programmes",
        blocks: [
          {
            type: "list",
            items: [
              "Everyday Spanish",
              "Relocation & Integration",
              "Workplace Spanish",
              "Business Spanish",
              "Academic Spanish",
              "Travel",
              "Industry-Specific Spanish",
              "Culture & Communication",
            ],
          },
        ],
      },
      {
        id: "qualifications",
        title: "Qualifications",
        blocks: [{ type: "list", items: ["DELE", "SIELE"] }],
      },
      {
        id: "book",
        blocks: [
          { type: "lead", text: "Start with an assessment. We'll help you find the right pathway." },
          {
            type: "buttons",
            ctas: [{ label: "Book Your Language Assessment", href: "/book-assessment" }],
          },
        ],
      },
    ],
  },
  {
    slug: "french",
    cardTitle: "France · French",
    meta: {
      title: "French & France | Mug.Up",
      description:
        "Everyday, workplace, business and academic French, travel and industry-specific French, plus DELF, DALF and TCF preparation with Mug.Up Global.",
    },
    hero: { title: "France · French" },
    sections: [
      {
        id: "programmes",
        title: "Programmes",
        blocks: [
          {
            type: "list",
            items: [
              "Everyday French",
              "Relocation & Integration",
              "Workplace French",
              "Business French",
              "Academic French",
              "Travel",
              "Industry-Specific French",
              "Culture & Communication",
            ],
          },
        ],
      },
      {
        id: "qualifications",
        title: "Qualifications",
        blocks: [{ type: "list", items: ["DELF", "DALF", "TCF"] }],
      },
      {
        id: "book",
        blocks: [
          { type: "lead", text: "Start with an assessment. We'll help you find the right pathway." },
          {
            type: "buttons",
            ctas: [{ label: "Book Your Language Assessment", href: "/book-assessment" }],
          },
        ],
      },
    ],
  },
  {
    slug: "german",
    cardTitle: "Germany · German",
    meta: {
      title: "German & Germany | Mug.Up",
      description:
        "Everyday, workplace, business and academic German, plus Goethe-Zertifikat, telc Deutsch and TestDaF preparation with Mug.Up Global.",
    },
    hero: { title: "Germany · German" },
    sections: [
      {
        id: "programmes",
        title: "Programmes",
        blocks: [
          {
            type: "list",
            items: [
              "Everyday German",
              "Relocation & Integration",
              "Workplace German",
              "Business German",
              "Academic German",
              "Travel",
              "Industry-Specific German",
              "Culture & Communication",
            ],
          },
        ],
      },
      {
        id: "qualifications",
        title: "Qualifications",
        blocks: [{ type: "list", items: ["Goethe-Zertifikat", "telc Deutsch", "TestDaF"] }],
      },
      {
        id: "book",
        blocks: [
          { type: "lead", text: "Start with an assessment. We'll help you find the right pathway." },
          {
            type: "buttons",
            ctas: [{ label: "Book Your Language Assessment", href: "/book-assessment" }],
          },
        ],
      },
    ],
  },
  {
    slug: "italian",
    cardTitle: "Italy · Italian",
    meta: {
      title: "Italian & Italy | Mug.Up",
      description:
        "Everyday, workplace, business and academic Italian, plus CILS, CELI and PLIDA preparation with Mug.Up Global.",
    },
    hero: { title: "Italy · Italian" },
    sections: [
      {
        id: "programmes",
        title: "Programmes",
        blocks: [
          {
            type: "list",
            items: [
              "Everyday Italian",
              "Relocation & Integration",
              "Workplace Italian",
              "Business Italian",
              "Academic Italian",
              "Travel",
              "Industry-Specific Italian",
              "Culture & Communication",
            ],
          },
        ],
      },
      {
        id: "qualifications",
        title: "Qualifications",
        blocks: [{ type: "list", items: ["CILS", "CELI", "PLIDA"] }],
      },
      {
        id: "book",
        blocks: [
          { type: "lead", text: "Start with an assessment. We'll help you find the right pathway." },
          {
            type: "buttons",
            ctas: [{ label: "Book Your Language Assessment", href: "/book-assessment" }],
          },
        ],
      },
    ],
  },
  {
    slug: "portuguese",
    cardTitle: "Portugal · Portuguese",
    meta: {
      title: "Portuguese & Portugal | Mug.Up",
      description:
        "Everyday, workplace, business and academic Portuguese, plus CAPLE preparation with Mug.Up Global.",
    },
    hero: { title: "Portugal · Portuguese" },
    sections: [
      {
        id: "programmes",
        title: "Programmes",
        blocks: [
          {
            type: "list",
            items: [
              "Everyday Portuguese",
              "Relocation & Integration",
              "Workplace Portuguese",
              "Business Portuguese",
              "Academic Portuguese",
              "Travel",
              "Industry-Specific Portuguese",
              "Culture & Communication",
            ],
          },
        ],
      },
      {
        id: "qualifications",
        title: "Qualifications",
        blocks: [{ type: "list", items: ["CAPLE"] }],
      },
      {
        id: "book",
        blocks: [
          { type: "lead", text: "Start with an assessment. We'll help you find the right pathway." },
          {
            type: "buttons",
            ctas: [{ label: "Book Your Language Assessment", href: "/book-assessment" }],
          },
        ],
      },
    ],
  },
  {
    slug: "ukrainian",
    cardTitle: "Ukraine · Ukrainian",
    meta: {
      title: "Ukrainian | Mug.Up",
      description:
        "Ukrainian for beginners, partners and families, heritage learners, children and young people — plus professional and cultural communication.",
    },
    hero: { title: "Ukraine · Ukrainian" },
    sections: [
      {
        id: "programmes",
        title: "Programmes",
        blocks: [
          {
            type: "list",
            items: [
              "Beginners",
              "Everyday Ukrainian",
              "Partners & Families",
              "Heritage Learners",
              "Children & Young People",
              "Professional & Cultural Communication",
              "Ukrainian Culture",
            ],
          },
        ],
      },
      {
        id: "book",
        blocks: [
          { type: "lead", text: "Start with an assessment. We'll help you find the right pathway." },
          {
            type: "buttons",
            ctas: [{ label: "Book Your Language Assessment", href: "/book-assessment" }],
          },
        ],
      },
    ],
  },
];
