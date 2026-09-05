-- Reviews get a language, and the client's own testimonials move into the
-- database so the admin panel manages them like any other review.
--
-- 1) reviews.locale — the homepage shows each language its own reviews
--    (the public form stores the page's locale; imports pick one).
-- 2) The 25 quotes the client supplied in "Відгуки.docx" (12 EN / 13 UA —
--    the doc has no English version of №11), inserted approved+featured
--    with fixed ids, so re-running is a no-op and the static copies in
--    src/content stay the no-database fallback only.
--    author_name carries the headline the doc uses ("GCSE", "Year 7"…);
--    programme repeats it for filtering; the home page shows it once.

alter table public.reviews
  add column locale text not null default 'en'
  check (locale in ('en', 'ua'));

create index reviews_locale_featured_idx
  on public.reviews (locale) where status = 'approved' and featured;

insert into public.reviews
  (id, created_at, locale, author_name, author_tag, quote, source, status,
   moderated_at, programme, featured)
values
  (md5('mugup-client-review:en:1')::uuid, now() - interval '0 minutes',
   'en', 'GCSE', '',
   'Good morning! We are incredibly grateful for all your help! Yarik achieved a Grade 7 in Maths and got into the school he wanted. Thank you so much! Please pass on our sincere thanks to his Maths teacher! Could you please let me know where I can leave a review for your school? I will definitely recommend you to others. 😁',
   'other', 'approved', now(), 'GCSE', true),
  (md5('mugup-client-review:en:2')::uuid, now() - interval '1 minutes',
   'en', 'GCSE', '',
   'Good evening, thank you. All the exams were passed. English was a Grade 4, which is a pass.',
   'other', 'approved', now(), 'GCSE', true),
  (md5('mugup-client-review:en:3')::uuid, now() - interval '2 minutes',
   'en', 'GCSE', '',
   'She got a Grade 4. :) Thank you! Yes, that’s good. :) And thank you for all your work!',
   'other', 'approved', now(), 'GCSE', true),
  (md5('mugup-client-review:en:4')::uuid, now() - interval '3 minutes',
   'en', 'GCSE', '',
   'Good afternoon, yes, of course. Maths — Grade 7. English — Grade 7. Thank you so much! 🫶 This is more than we expected, as Denis had only been studying at school for two years.',
   'other', 'approved', now(), 'GCSE', true),
  (md5('mugup-client-review:en:5')::uuid, now() - interval '4 minutes',
   'en', 'English for Accountants', '',
   'I really enjoyed the first lesson! The course is interesting and well organised. There is homework to complete before each lesson, which makes it easier to prepare for the topic. The course is taught by a native English speaker, which is very useful for understanding accounting and business terminology in the UK. It was challenging, but incredibly useful and motivating.',
   'other', 'approved', now(), 'English for Accountants', true),
  (md5('mugup-client-review:en:6')::uuid, now() - interval '5 minutes',
   'en', 'English for Accountants', '',
   'Good morning! I really enjoyed the first lesson, thank you. Would it be possible to upload the presentation separately from the lesson video? Thank you.',
   'other', 'approved', now(), 'English for Accountants', true),
  (md5('mugup-client-review:en:7')::uuid, now() - interval '6 minutes',
   'en', 'Year 10', '',
   'Good evening. We wanted to let you know that Ulyana will have her final lesson on Monday, 25 May. We won’t continue next month as the summer holidays are starting, and Ulyana and I will decide when to resume lessons in the new academic year. We really like your approach and are very happy that we chose you. Thank you. We still have one more lesson on Monday.',
   'other', 'approved', now(), 'Year 10', true),
  (md5('mugup-client-review:en:8')::uuid, now() - interval '7 minutes',
   'en', 'Year 7', '',
   'Good afternoon, I just wanted to share this 🙈 My son brought home his Maths test results yesterday, and I’m very happy! They took the same type of test before the New Year and again now. Before the New Year, he scored 10/65 — 10 correct answers out of 65. Now he has scored 45/65. More than half are correct, and we’re steadily moving forward 💪 Thank you! We’ll be back in September 💛 Have a lovely day :)',
   'other', 'approved', now(), 'Year 7', true),
  (md5('mugup-client-review:en:9')::uuid, now() - interval '8 minutes',
   'en', 'Year 11', '',
   'Good morning, Ievgeniia! I hope this message finds you in a wonderful mood 😊 Thank you so much for all your work! You did everything you could to make both me and my children feel comfortable. Thank you for your patience and understanding with all our late arrivals and rescheduled lessons. We may not always have been the easiest students, and I hope you didn’t mind. You and your team are amazing! 👍 We are really hoping for positive results 🙏 I’m sincerely grateful to the teachers for all their work. My children really liked them and always looked forward to their next lesson. Wishing you a wonderful summer break, lots of positive emotions, unforgettable moments and wonderful people around you! THANK YOU!!!!!!',
   'other', 'approved', now(), 'Year 11', true),
  (md5('mugup-client-review:en:10')::uuid, now() - interval '9 minutes',
   'en', 'General English', '',
   'Thank you to Mug.Up Language Studio and teacher Anastasiia for the lessons. We have seen noticeable progress during this time. Tykhomyr is now getting very good grades in English at school, and I can see real results from the lessons.',
   'other', 'approved', now(), 'General English', true),
  (md5('mugup-client-review:en:11')::uuid, now() - interval '10 minutes',
   'en', 'Grade 8 Mock Test', '',
   'Wow!! [Student] did a test at school and got a Grade 8 — it’s what we’ve been covering the last 6 weeks or so! 🎉 — Is that a Mock test? — Yes! 🙌',
   'other', 'approved', now(), 'Grade 8 Mock Test', true),
  (md5('mugup-client-review:en:12')::uuid, now() - interval '11 minutes',
   'en', 'GCSE', '',
   'Good morning! I got a 4, and I’m very happy that I passed everything! A huge thank you to the teachers for their support and help over the past two years of my studies!',
   'other', 'approved', now(), 'GCSE', true),
  (md5('mugup-client-review:ua:1')::uuid, now() - interval '0 minutes',
   'ua', 'GCSE', '',
   'Доброго ранку, дуже вам вдячні за вашу величезну допомогу! Ярик отримав 7 з математики і поступив у школу, яку хотів. Дуже дякуємо вам! Передайте найщирішу подяку вчителю математики! Скажіть, будь ласка, де можна залишити відгук про вашу школу, я однозначно буду радити знайомим 😁',
   'other', 'approved', now(), 'GCSE', true),
  (md5('mugup-client-review:ua:2')::uuid, now() - interval '1 minutes',
   'ua', 'GCSE', '',
   'Доброго вечора, дякую, всі екзамени pass. Англійська 4, але прохідна.',
   'other', 'approved', now(), 'GCSE', true),
  (md5('mugup-client-review:ua:3')::uuid, now() - interval '2 minutes',
   'ua', 'GCSE', '',
   'Здала на 4. :) Дякую! Так, це добре :) І вам дякую за роботу!',
   'other', 'approved', now(), 'GCSE', true),
  (md5('mugup-client-review:ua:4')::uuid, now() - interval '3 minutes',
   'ua', 'GCSE', '',
   'Добрий день, так звичайно. Математика — 7. Англійська — 7. Дякуємо щиро Вам 🫶 Це більше ніж ми очікували, оскільки Денис вчився у школі лише 2 роки.',
   'other', 'approved', now(), 'GCSE', true),
  (md5('mugup-client-review:ua:5')::uuid, now() - interval '4 minutes',
   'ua', 'English for Accountants', '',
   'Дуже сподобалося перше заняття! Курс цікавий і добре організований. Перед уроком потрібно виконати домашнє завдання, тому легше підготуватися до теми. Викладає носій англійської мови, і це дуже корисно для розуміння бухгалтерської та бізнес-лексики у Великій Британії. Було нелегко, але дуже корисно й мотивуюче.',
   'other', 'approved', now(), 'English for Accountants', true),
  (md5('mugup-client-review:ua:6')::uuid, now() - interval '5 minutes',
   'ua', 'English for Accountants', '',
   'Добрий ранок! Дуже сподобався перший урок. Дякую. Чи можна викласти тільки презентацію? Окремо від відео уроку. Дякую.',
   'other', 'approved', now(), 'English for Accountants', true),
  (md5('mugup-client-review:ua:7')::uuid, now() - interval '6 minutes',
   'ua', 'Year 10', '',
   'Доброго вечора, хочемо попередити, що Ульяна останній понеділок 25 травня ще має заняття, а наступний місяць ми продовжити не будемо, літні канікули розпочнуться і вже тоді ми з Уляною вирішимо в наступному навчальному році, коли ми будемо далі займатися. Нам дуже подобається ваш підхід, ми не помилилися, що обрали вас, дякуємо. Але ще до одної зустрічі в понеділок.',
   'other', 'approved', now(), 'Year 10', true),
  (md5('mugup-client-review:ua:8')::uuid, now() - interval '7 minutes',
   'ua', 'Year 7', '',
   'Доброго дня, хочу просто поділитись 🙈 Син вчора приніс результати тестів з математики, я дуже задоволена! Вони здавали такі тести перед Новим роком і тепер. До Нового року в нього було 10/65 (10 правильних з 65). Тепер 45/65, більше половини правильно, помаленько йдемо вперед 💪 Дякую! З вересня повернемось 💛 Гарного дня :)',
   'other', 'approved', now(), 'Year 7', true),
  (md5('mugup-client-review:ua:9')::uuid, now() - interval '8 minutes',
   'ua', 'Year 11', '',
   'Доброго ранку, п. Євгеніє! Сподіваюся, моє повідомлення застало вас у чудовому настрої 😊 Щиро дякую вам за вашу роботу!!! Ви зробили все, щоб я та мої діти почувалися комфортно. Прошу вибачення та розуміння за усі запізнення та перенесення уроків. Може, ми не були досить чемними студентами, сподіваюся, ви не ображаєтеся. Ви та ваша команда бомбезні 👍 Ми дуже сподіваємося на позитивні результати 🙏 Щиро вдячна вчителям за роботу. Моїм дітям вони дуже сподобалися і вони з нетерпінням чекали наступного уроку. Бажаю вам гарного літнього відпочинку, позитивних емоцій та незабутніх моментів, чудових та позитивних людей!!! ДЯКУЮ!!!!!!',
   'other', 'approved', now(), 'Year 11', true),
  (md5('mugup-client-review:ua:10')::uuid, now() - interval '9 minutes',
   'ua', 'General English', '',
   'Дякую студії мов Mug.Up та викладачці Анастасії за навчання — за цей час є помітний прогрес. У Тихомира в школі з англійської зараз дуже хороші оцінки, бачу реальний результат після занять.',
   'other', 'approved', now(), 'General English', true),
  (md5('mugup-client-review:ua:11')::uuid, now() - interval '10 minutes',
   'ua', 'Year 11', '',
   'Mug.Up: Пані Маріє! Ми дуже раді результатам на Mock тестах!!! Вона молодець! Ми бажаємо їй успіхів ще більших і менше стресу!!! — Відповідь мами: Дякую, мені це дуже приємно чути. Моїм дітям подобається працювати з вашими вчителями. Щиро вдячна за вашу роботу!!!',
   'other', 'approved', now(), 'Year 11', true),
  (md5('mugup-client-review:ua:12')::uuid, now() - interval '11 minutes',
   'ua', 'Grade 8 Mock Test', '',
   'Вау!! [Учень/учениця] склав(-ла) тест у школі та отримав(-ла) Grade 8 — це саме той матеріал, над яким ми працювали протягом останніх приблизно шести тижнів! 🎉 — Це був Mock test? — Так! 🙌',
   'other', 'approved', now(), 'Grade 8 Mock Test', true),
  (md5('mugup-client-review:ua:13')::uuid, now() - interval '12 minutes',
   'ua', 'GCSE', '',
   'Доброго ранку! Я отримала 4 і дуже рада, що все пройшла! Викладачам велике дякую за підтримку та допомогу за останні 2 роки навчання!',
   'other', 'approved', now(), 'GCSE', true)
on conflict (id) do nothing;
