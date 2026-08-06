import type { FormPage } from "@/content/types";

// Ukrainian version of the contact page (copy drafted for launch).
export const page: FormPage = {
  meta: {
    title: "Контакти | Mug.Up",
    description:
      "Зв'яжіться з Mug.Up Language Studio в Бедфорді: питання про програми, вартість чи партнерство, або завітайте до нашого навчального центру на St Loyes Street.",
  },
  hero: {
    title: "Зв'яжіться з нами",
    subtitle: "Ми радо відповімо на ваші запитання й допоможемо зробити наступний крок.",
    body: [
      "Маєте запитання про наші програми, хочете обговорити навчальний шлях для своєї родини чи зацікавлені у співпраці — напишіть нам, і ми з радістю допоможемо.",
    ],
  },
  sections: [
    {
      id: "contact-details",
      title: "Завітайте або напишіть нам",
      blocks: [
        {
          type: "paragraph",
          text: "Наш навчальний центр розташований за адресою 66–68 St Loyes St, Bedford MK40 1EZ, за кілька хвилин пішки від центру Бедфорда. Запрошуємо завітати особисто або зв'язатися з нами онлайн — зазвичай ми відповідаємо протягом одного робочого дня.",
        },
        {
          type: "paragraph",
          text: "Стежте за Mug.Up Language Studio в соціальних мережах — там ми ділимося новинами, порадами для навчання та подіями нашої спільноти.",
        },
      ],
    },
  ],
  form: {
    title: "Надішліть нам повідомлення",
    intro: "Заповніть форму нижче — і ми відповімо вам якнайшвидше.",
    fields: [
      { name: "fullName", label: "Повне ім'я", type: "text", required: true },
      { name: "email", label: "Електронна пошта", type: "email", required: true },
      { name: "phone", label: "Номер телефону", type: "tel" },
      {
        name: "subject",
        label: "Тема звернення",
        type: "select",
        options: ["Загальне запитання", "Програми та вартість", "Партнерство", "Інше"],
      },
      {
        name: "message",
        label: "Ваше повідомлення",
        type: "textarea",
        required: true,
      },
      {
        name: "attachment",
        label: "Вкладення",
        type: "file",
        hint: "За бажанням — додайте файл, якщо він допоможе пояснити ваш запит.",
      },
      {
        name: "consent",
        label:
          "Я даю згоду Mug.Up Language Studio на зберігання та обробку наданих у цій формі даних для відповіді на мій запит відповідно до Політики конфіденційності.",
        type: "checkbox",
        required: true,
      },
    ],
    submitLabel: "Надіслати повідомлення",
    disabledNote:
      "Бекенд форми ще не підключено — на цьому етапі надсилання вимкнено.",
  },
};
