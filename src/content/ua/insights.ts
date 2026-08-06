import type { InsightsIndexPage } from "@/content/types";

// Categories per client doc "Structure.docx" (section 4. Insights).
// Page copy is ours; real articles arrive from the client later.
export const page: InsightsIndexPage = {
  meta: {
    title: "Insights — статті та поради | Mug.Up",
    description:
      "Практичні статті та поради про британську освіту, мовні іспити, розвиток кар’єри та інтеграцію у Великій Британії від команди Mug.Up Language Studio.",
  },
  hero: {
    title: "Insights",
    subtitle:
      "Поради щодо освіти у Великій Британії, іспитів, кар’єри та інтеграції — практичні відповіді на запитання, які нам найчастіше ставлять учні та родини.",
  },
  sections: [
    {
      id: "browse",
      title: "Оберіть категорію",
      blocks: [
        {
          type: "paragraph",
          text: "Переглядайте наші статті за категоріями нижче — від вибору мовного іспиту до облаштування життя, навчання й роботи у Великій Британії. Нові матеріали з’являються регулярно.",
        },
      ],
    },
  ],
  categories: [
    {
      id: "uk-education",
      label: "Освіта у Великій Британії",
      blurb: "Школи, іспити та вступ до університетів у британській системі освіти.",
    },
    {
      id: "english-qualifications",
      label: "Кваліфікації з англійської",
      blurb: "IELTS, Cambridge English, SELT, ESOL — і як обрати іспит, що відповідає вашій меті.",
    },
    {
      id: "career-workplace",
      label: "Кар’єра та робота",
      blurb: "Професійна англійська, резюме, співбесіди та розвиток кар’єри у Великій Британії.",
    },
    {
      id: "integration-uk",
      label: "Інтеграція у Великій Британії",
      blurb: "Практичні поради, як облаштувати повсякденне життя, навчання й роботу в Британії.",
    },
    {
      id: "language-learning",
      label: "Вивчення мов",
      blurb: "Методи, мотивація та звички, завдяки яким вивчення мови стає ефективним у будь-якому віці.",
    },
  ],
};
