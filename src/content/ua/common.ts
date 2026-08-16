import type { CommonDict } from "@/content/types";

export const common: CommonDict = {
  siteName: "Mug.Up Language Studio",
  nav: {
    home: "Головна",
    about: "Про нас",
    pathways: "Напрями",
    pathwaysBritish: "Британська освіта",
    pathwaysGlobal: "Глобальна інтеграція",
    courses: "Курси та програми",
    insights: "Insights",
    bookAssessment: "Записатися на оцінювання",
    contact: "Контакти",
  },
  footer: {
    tagline: "Освіта. Інтеграція. Можливості.",
    groups: [
      {
        title: "Напрями",
        links: [
          { label: "Mug.Up Britain", href: "/pathways/british-education" },
          { label: "Mug.Up Global Integration", href: "/pathways/global-integration" },
          { label: "Мови", href: "https://mugup.com.ua" },
        ],
      },
      {
        title: "Компанія",
        links: [
          { label: "Про нас", href: "/about" },
          { label: "Insights", href: "/insights" },
        ],
      },
      {
        title: "Підтримка",
        links: [
          { label: "Контакти", href: "/contact" },
          { label: "Записатися на оцінювання", href: "/book-assessment" },
          { label: "Залишити відгук", href: "/review" },
        ],
      },
      {
        title: "Правова інформація",
        links: [
          { label: "Політика конфіденційності", href: "/privacy-policy" },
          { label: "Умови користування", href: "/terms" },
        ],
      },
    ],
    contactHeading: "Контактна інформація",
    addressLabel: "Адреса навчального центру",
    followHeading: "Ми в соцмережах",
  },
  ui: {
    skipToContent: "Перейти до вмісту",
    openMenu: "Меню",
    breadcrumbsHome: "Головна",
    atAGlance: "Коротко про головне",
    explore: "Переглянути",
    readMore: "Читати далі",
    allCategories: "Усі категорії",
    postedIn: "Опубліковано в категорії",
    samplePostNotice: "Зразок статті — тимчасовий вміст, який буде замінено перед запуском сайту.",
    formNotWired: "Бекенд форми ще не підключено — на цьому етапі надсилання вимкнено.",
    localeSwitchLabel: "Мова сайту",
    imagePlaceholder: "Місце для зображення",
    stage2Notice: "Повні сторінки програм з'являться на другому етапі.",
    formSent: "Дякуємо — ваше повідомлення надіслано. Ми зв'яжемося з вами найближчим часом.",
    formError: "Сталася помилка, повідомлення не надіслано. Перевірте поля та спробуйте ще раз.",
    meetFullTeam: "Уся команда — на сторінці «Про нас»",
  },
};
