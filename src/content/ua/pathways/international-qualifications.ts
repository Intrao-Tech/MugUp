import type { Page } from "@/content/types";

export const page: Page = {
  meta: {
    title: "Міжнародні мовні кваліфікації | Mug.Up",
    description:
      "Підготовка до міжнародно визнаних мовних кваліфікацій — IELTS, Cambridge English, LanguageCert та інших — для освіти, роботи, міграційних вимог і мобільності.",
  },
  hero: {
    eyebrow: "Кваліфікації для глобальних можливостей",
    title: "Міжнародні мовні кваліфікації",
    body: [
      "Підготовка до міжнародно визнаних мовних кваліфікацій для освіти, роботи, міграційних вимог та міжнародної мобільності.",
    ],
    ctas: [{ label: "Записатися на оцінювання", href: "/book-assessment" }],
  },
  sections: [
    {
      id: "qualifications-we-cover",
      title: "Кваліфікації, які ми покриваємо",
      intro:
        "Для англійської мови нижче є окремі програми підготовки; підготовка до кваліфікацій з інших мов організовується в межах наших мовних програм.",
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
          title: "Не впевнені, яка кваліфікація вам потрібна?",
          body: "Коротке оцінювання співвідносить вашу мету — університет, робота, віза чи мобільність — із правильною кваліфікацією та планом підготовки.",
          cta: { label: "Записатися на оцінювання", href: "/book-assessment" },
        },
      ],
    },
  ],
};
