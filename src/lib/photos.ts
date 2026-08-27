import type { Locale } from "@/content/types";

/**
 * Photography registry. Client photos + licensed stock (Unsplash/Pexels
 * free licences, downloaded into /public/images/photos as WebP ≤1600px —
 * never hotlinked, never AI). Sources: docs/PHOTO-CREDITS.md.
 * Keys: `hero:<route>` for page heroes, `panel:<route>` for the pathway
 * panels (matched by the card href), `split:<section-id>` for 50/50
 * sections, `insights` for the featured post. A missing key renders the
 * ruled-paper ImagePlaceholder, so pages never break while photos are
 * pending. Alt text is descriptive, per locale (a11y + SEO).
 */
export interface Photo {
  src: string;
  alt: Record<Locale, string>;
  /** Object-position for the crop, e.g. "50% 30%". */
  position?: string;
}

const P = "/images/photos";

export const PHOTOS: Record<string, Photo> = {
  "hero:/": {
    src: `${P}/home-hero.webp`,
    alt: { en: "A tutor and a student talking through work in a bright study room", ua: "Тьюторка й студент обговорюють завдання у світлій навчальній кімнаті" },
  },
  "hero:/about": {
    src: `${P}/about-hero.webp`,
    alt: { en: "A tutor guiding a teenage student through her notes", ua: "Тьюторка допомагає учениці-підлітку з нотатками" },
  },
  "hero:/pathways/british-education": {
    src: `${P}/british.webp`,
    alt: { en: "Secondary-school students working together on laptops and notebooks", ua: "Учні середньої школи працюють разом із ноутбуками та зошитами" },
    position: "50% 35%",
  },
  "panel:/pathways/british-education": {
    src: `${P}/british.webp`,
    alt: { en: "Secondary-school students working together on laptops and notebooks", ua: "Учні середньої школи працюють разом із ноутбуками та зошитами" },
    position: "50% 35%",
  },
  "hero:/pathways/global-integration": {
    src: `${P}/global.webp`,
    alt: { en: "An international team in discussion around a table in a modern office", ua: "Міжнародна команда обговорює роботу за столом у сучасному офісі" },
  },
  "panel:/pathways/global-integration": {
    src: `${P}/global.webp`,
    alt: { en: "An international team in discussion around a table in a modern office", ua: "Міжнародна команда обговорює роботу за столом у сучасному офісі" },
  },
  "split:for-parents": {
    src: `${P}/for-parents.webp`,
    alt: { en: "A parent helping a teenager with homework at the kitchen table", ua: "Мама допомагає підлітку з домашнім завданням за столом" },
  },
  "split:supporting-families": {
    src: `${P}/families.webp`,
    alt: { en: "A family walking across a bridge in London", ua: "Родина йде мостом у Лондоні" },
    position: "50% 40%",
  },
  "hero:/pathways/british-education/sats-preparation": {
    src: `${P}/sats.webp`,
    alt: { en: "A primary-school pupil writing carefully at her desk", ua: "Учениця початкової школи уважно пише за партою" },
  },
  "hero:/pathways/british-education/11-plus-preparation": {
    src: `${P}/eleven-plus.webp`,
    alt: { en: "A boy concentrating on a book at a tidy desk", ua: "Хлопчик зосереджено читає книгу за столом" },
  },
  "hero:/pathways/british-education/secondary-education": {
    src: `${P}/secondary.webp`,
    alt: { en: "Teenagers studying among the shelves of a school library", ua: "Підлітки навчаються серед полиць шкільної бібліотеки" },
  },
  "hero:/pathways/british-education/gcse-pathways": {
    src: `${P}/gcse.webp`,
    alt: { en: "Two GCSE students reading a textbook together in a library", ua: "Двоє учнів GCSE разом читають підручник у бібліотеці" },
  },
  "hero:/pathways/british-education/post-16-pathways": {
    src: `${P}/post-16.webp`,
    alt: { en: "Sixth-form students working with a laptop and textbook", ua: "Старшокласники працюють із ноутбуком і підручником" },
  },
  "hero:/pathways/british-education/university-application-support": {
    src: `${P}/university.webp`,
    alt: { en: "Students walking across a university campus", ua: "Студенти йдуть університетським кампусом" },
  },
  "hero:/pathways/british-education/esol": {
    src: `${P}/esol.webp`,
    alt: { en: "Adult learners in a lecture room with their teacher", ua: "Дорослі учні в аудиторії з викладачем" },
  },
  "hero:/pathways/british-education/functional-skills-english-maths": {
    src: `${P}/exam-room.webp`,
    alt: { en: "Adult candidates sitting a written exam", ua: "Дорослі кандидати складають письмовий іспит" },
  },
  "hero:/pathways/global-integration/qualifications/ielts-preparation": {
    src: `${P}/exam-laptop.webp`,
    alt: { en: "A candidate taking a computer-based English test", ua: "Кандидатка складає комп'ютерний тест з англійської" },
  },
  "hero:/pathways/global-integration/qualifications/cambridge-english-qualifications": {
    src: `${P}/exam-pair.webp`,
    alt: { en: "Two adults writing an exam paper in a classroom", ua: "Двоє дорослих пишуть екзаменаційну роботу в класі" },
  },
  "hero:/pathways/global-integration/qualifications/selt-preparation": {
    src: `${P}/exam-room.webp`,
    alt: { en: "Adult candidates sitting a written exam", ua: "Дорослі кандидати складають письмовий іспит" },
  },
  "hero:/pathways/global-integration/qualifications/languagecert": {
    src: `${P}/exam-laptop.webp`,
    alt: { en: "A candidate taking a computer-based English test", ua: "Кандидатка складає комп'ютерний тест з англійської" },
  },
  "hero:/pathways/global-integration/boarding-schools": {
    src: `${P}/boarding.webp`,
    alt: { en: "A historic college building in Oxford", ua: "Історичний корпус коледжу в Оксфорді" },
    position: "50% 60%",
  },
  insights: {
    src: `${P}/insights.webp`,
    alt: { en: "An open notebook and pen on a wooden desk", ua: "Розгорнутий зошит і ручка на дерев'яному столі" },
  },
  "hero:/pathways/global-integration/spanish": {
    src: `${P}/spain.webp`,
    alt: { en: "Plaza Mayor in Madrid on an ordinary afternoon", ua: "Пласа-Майор у Мадриді звичайного дня" },
  },
  "hero:/pathways/global-integration/french": {
    src: `${P}/france.webp`,
    alt: { en: "A café terrace on a Paris street corner", ua: "Тераса кафе на розі паризької вулиці" },
  },
  "hero:/pathways/global-integration/german": {
    src: `${P}/germany.webp`,
    alt: { en: "A tree-shaded beer garden in Munich", ua: "Затінений деревами пивний сад у Мюнхені" },
  },
  "hero:/pathways/global-integration/italian": {
    src: `${P}/italy.webp`,
    alt: { en: "A sunny piazza with café tables in Italy", ua: "Сонячна п'яцца зі столиками кафе в Італії" },
  },
  "hero:/pathways/global-integration/portuguese": {
    src: `${P}/portugal.webp`,
    alt: { en: "The riverside promenade in Porto", ua: "Набережна в Порту" },
  },
  "hero:/pathways/global-integration/ukrainian": {
    src: `${P}/ukraine.webp`,
    alt: { en: "Historic façades on a street in Lviv", ua: "Історичні фасади на вулиці Львова" },
  },
};

export function photoFor(key: string): Photo | undefined {
  return PHOTOS[key];
}
