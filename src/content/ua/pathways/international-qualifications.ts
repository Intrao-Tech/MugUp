import type { Page } from "@/content/types";

export const page: Page = {
  meta: {
    title: "Міжнародні мовні тести | Mug.Up",
    description:
      "Підготовка до міжнародно визнаних мовних тестів — IELTS, Cambridge English, LanguageCert та інших — для навчання, роботи, міграції та мобільності.",
  },
  hero: {
    eyebrow: "Тести для глобальних можливостей",
    title: "Міжнародні мовні тести",
    body: [
      "Підготовка до міжнародно визнаних мовних тестів для навчання, роботи, міграції та міжнародної мобільності.",
    ],
    ctas: [{ label: "Отримати консультацію", href: "/book-assessment" }],
  },
  sections: [
    {
      id: "qualifications-we-cover",
      title: "Тести, які ми покриваємо",
      intro:
        "Для англійської мови нижче є окремі програми підготовки; підготовка до тестів з інших мов організовується в межах наших мовних програм.",
      blocks: [
        {
          type: "list",
          items: [
            "Англійська: IELTS · Cambridge English · LanguageCert (SELT)",
            "Іспанська: DELE · SIELE",
            "Французька: DELF · DALF · TCF",
            "Німецька: Goethe-Zertifikat · telc Deutsch · TestDaF",
            "Італійська: CILS · CELI · PLIDA",
            "Португальська: CAPLE",
          ],
        },
      ],
    },
    {
      id: "start-cta",
      blocks: [
        {
          type: "cta",
          title: "Не впевнені, який тест вам потрібен?",
          body: "Коротке оцінювання співвідносить вашу мету — університет, робота, віза чи мобільність — із правильним тестом і планом підготовки.",
          cta: { label: "Отримати консультацію", href: "/book-assessment" },
        },
      ],
    },
  ],
};
