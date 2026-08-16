import type { LanguagePage } from "@/content/types";

// Українські версії підсторінок мов "Глобальної інтеграції". Дзеркалять
// src/content/en/pathways/global-integration-languages.ts: slugs, ids та hrefs
// ідентичні; переклад — з клієнтського EN-документа v2.
export const pages: LanguagePage[] = [
  {
    slug: "spanish",
    cardTitle: "Іспанія · Іспанська",
    meta: {
      title: "Іспанська та Іспанія | Mug.Up",
      description:
        "Повсякденна, робоча, ділова та академічна іспанська, галузева іспанська, а також підготовка до DELE та SIELE разом із Mug.Up Global.",
    },
    hero: { title: "Іспанія · Іспанська" },
    sections: [
      {
        id: "programmes",
        title: "Програми",
        blocks: [
          {
            type: "list",
            items: [
              "Повсякденна іспанська",
              "Релокація та інтеграція",
              "Іспанська для роботи",
              "Ділова іспанська",
              "Академічна іспанська",
              "Подорожі",
              "Галузева іспанська",
              "Культура та спілкування",
            ],
          },
        ],
      },
      {
        id: "qualifications",
        title: "Кваліфікації",
        blocks: [{ type: "list", items: ["DELE", "SIELE"] }],
      },
      {
        id: "book",
        blocks: [
          { type: "lead", text: "Почніть з оцінювання. Ми допоможемо знайти правильний шлях." },
          {
            type: "buttons",
            ctas: [{ label: "Записатися на мовне оцінювання", href: "/book-assessment" }],
          },
        ],
      },
    ],
  },
  {
    slug: "french",
    cardTitle: "Франція · Французька",
    meta: {
      title: "Французька та Франція | Mug.Up",
      description:
        "Повсякденна, робоча, ділова та академічна французька, галузева французька, а також підготовка до DELF, DALF і TCF разом із Mug.Up Global.",
    },
    hero: { title: "Франція · Французька" },
    sections: [
      {
        id: "programmes",
        title: "Програми",
        blocks: [
          {
            type: "list",
            items: [
              "Повсякденна французька",
              "Релокація та інтеграція",
              "Французька для роботи",
              "Ділова французька",
              "Академічна французька",
              "Подорожі",
              "Галузева французька",
              "Культура та спілкування",
            ],
          },
        ],
      },
      {
        id: "qualifications",
        title: "Кваліфікації",
        blocks: [{ type: "list", items: ["DELF", "DALF", "TCF"] }],
      },
      {
        id: "book",
        blocks: [
          { type: "lead", text: "Почніть з оцінювання. Ми допоможемо знайти правильний шлях." },
          {
            type: "buttons",
            ctas: [{ label: "Записатися на мовне оцінювання", href: "/book-assessment" }],
          },
        ],
      },
    ],
  },
  {
    slug: "german",
    cardTitle: "Німеччина · Німецька",
    meta: {
      title: "Німецька та Німеччина | Mug.Up",
      description:
        "Повсякденна, робоча, ділова та академічна німецька, а також підготовка до Goethe-Zertifikat, telc Deutsch і TestDaF разом із Mug.Up Global.",
    },
    hero: { title: "Німеччина · Німецька" },
    sections: [
      {
        id: "programmes",
        title: "Програми",
        blocks: [
          {
            type: "list",
            items: [
              "Повсякденна німецька",
              "Релокація та інтеграція",
              "Німецька для роботи",
              "Ділова німецька",
              "Академічна німецька",
              "Подорожі",
              "Галузева німецька",
              "Культура та спілкування",
            ],
          },
        ],
      },
      {
        id: "qualifications",
        title: "Кваліфікації",
        blocks: [{ type: "list", items: ["Goethe-Zertifikat", "telc Deutsch", "TestDaF"] }],
      },
      {
        id: "book",
        blocks: [
          { type: "lead", text: "Почніть з оцінювання. Ми допоможемо знайти правильний шлях." },
          {
            type: "buttons",
            ctas: [{ label: "Записатися на мовне оцінювання", href: "/book-assessment" }],
          },
        ],
      },
    ],
  },
  {
    slug: "italian",
    cardTitle: "Італія · Італійська",
    meta: {
      title: "Італійська та Італія | Mug.Up",
      description:
        "Повсякденна, робоча, ділова та академічна італійська, а також підготовка до CILS, CELI і PLIDA разом із Mug.Up Global.",
    },
    hero: { title: "Італія · Італійська" },
    sections: [
      {
        id: "programmes",
        title: "Програми",
        blocks: [
          {
            type: "list",
            items: [
              "Повсякденна італійська",
              "Релокація та інтеграція",
              "Італійська для роботи",
              "Ділова італійська",
              "Академічна італійська",
              "Подорожі",
              "Галузева італійська",
              "Культура та спілкування",
            ],
          },
        ],
      },
      {
        id: "qualifications",
        title: "Кваліфікації",
        blocks: [{ type: "list", items: ["CILS", "CELI", "PLIDA"] }],
      },
      {
        id: "book",
        blocks: [
          { type: "lead", text: "Почніть з оцінювання. Ми допоможемо знайти правильний шлях." },
          {
            type: "buttons",
            ctas: [{ label: "Записатися на мовне оцінювання", href: "/book-assessment" }],
          },
        ],
      },
    ],
  },
  {
    slug: "portuguese",
    cardTitle: "Португалія · Португальська",
    meta: {
      title: "Португальська та Португалія | Mug.Up",
      description:
        "Повсякденна, робоча, ділова та академічна португальська, а також підготовка до CAPLE разом із Mug.Up Global.",
    },
    hero: { title: "Португалія · Португальська" },
    sections: [
      {
        id: "programmes",
        title: "Програми",
        blocks: [
          {
            type: "list",
            items: [
              "Повсякденна португальська",
              "Релокація та інтеграція",
              "Португальська для роботи",
              "Ділова португальська",
              "Академічна португальська",
              "Подорожі",
              "Галузева португальська",
              "Культура та спілкування",
            ],
          },
        ],
      },
      {
        id: "qualifications",
        title: "Кваліфікації",
        blocks: [{ type: "list", items: ["CAPLE"] }],
      },
      {
        id: "book",
        blocks: [
          { type: "lead", text: "Почніть з оцінювання. Ми допоможемо знайти правильний шлях." },
          {
            type: "buttons",
            ctas: [{ label: "Записатися на мовне оцінювання", href: "/book-assessment" }],
          },
        ],
      },
    ],
  },
  {
    slug: "ukrainian",
    cardTitle: "Україна · Українська",
    meta: {
      title: "Українська мова | Mug.Up",
      description:
        "Українська для початківців, партнерів і родин, тих, хто має українське коріння, дітей та підлітків, а також професійна та культурна комунікація.",
    },
    hero: { title: "Україна · Українська" },
    sections: [
      {
        id: "programmes",
        title: "Програми",
        blocks: [
          {
            type: "list",
            items: [
              "Для початківців",
              "Повсякденна українська",
              "Для партнерів і родин",
              "Для тих, хто має українське коріння",
              "Діти та підлітки",
              "Професійна та культурна комунікація",
              "Українська культура",
            ],
          },
        ],
      },
      {
        id: "book",
        blocks: [
          { type: "lead", text: "Почніть з оцінювання. Ми допоможемо знайти правильний шлях." },
          {
            type: "buttons",
            ctas: [{ label: "Записатися на мовне оцінювання", href: "/book-assessment" }],
          },
        ],
      },
    ],
  },
];
