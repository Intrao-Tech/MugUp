// Seed: creates team accounts and demo data.
//
//   npm run seed:dev      local Docker stack (.env.local) — the default.
//   npm run seed:remote   a hosted project (.env.remote) — requires the
//                         explicit SEED_ALLOW_REMOTE=1 opt-in in that file.
//
// Knobs (env):
//   SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD  real administrator to create
//                                           (instead of the @mugup.local trio)
//   SEED_DEMO_DATA=0                        skip demo leads/reviews/posts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const isLocal = /(127\.0\.0\.1|localhost)/.test(url);
const allowRemote = process.env.SEED_ALLOW_REMOTE === "1";
if (!isLocal && !allowRemote) {
  console.error(
    `Refusing to seed a non-local Supabase URL: ${url}` +
      " — set SEED_ALLOW_REMOTE=1 in the env file if this is really the project you mean.",
  );
  process.exit(1);
}
if (!isLocal) {
  console.log(`! Seeding a REMOTE project: ${url}`);
}

// A real administrator (own email + password) instead of the demo trio.
const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim();
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "";
if (adminEmail && adminPassword.length < 8) {
  console.error("SEED_ADMIN_PASSWORD must be at least 8 characters (upper + lower + digit).");
  process.exit(1);
}
const withDemoData = process.env.SEED_DEMO_DATA !== "0";

const service = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ALL_PERMISSIONS = [
  "leads.view", "leads.manage", "leads.export", "leads.pii",
  "posts.edit", "posts.publish", "reviews.moderate", "analytics.view", "users.manage",
];

const DEMO_PASSWORD = "admin123";
// A named administrator replaces the demo trio entirely — never put
// admin123 accounts on a hosted project.
const USERS = adminEmail
  ? [{ email: adminEmail, password: adminPassword, name: process.env.SEED_ADMIN_NAME ?? "Administrator", role: "admin", permissions: ALL_PERMISSIONS }]
  : [
      { email: "admin@mugup.local", password: DEMO_PASSWORD, name: "Local Admin", role: "admin", permissions: ALL_PERMISSIONS },
      { email: "manager@mugup.local", password: DEMO_PASSWORD, name: "Test Manager", role: "manager", permissions: ["leads.view", "leads.manage", "leads.export", "leads.pii", "posts.edit", "posts.publish", "reviews.moderate", "analytics.view"] },
      { email: "editor@mugup.local", password: DEMO_PASSWORD, name: "Test Editor", role: "editor", permissions: ["posts.edit", "posts.publish", "reviews.moderate"] },
    ];

for (const user of USERS) {
  const { data, error } = await service.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
  });
  // Existing account: re-apply the profile so a re-run repairs access
  // (the id comes from the profiles table, keyed by email).
  let userId = data?.user?.id ?? null;
  if (error) {
    const { data: existing } = await service
      .from("profiles")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();
    userId = existing?.id ?? null;
    if (!userId) {
      console.log(`~ ${user.email}: ${error.message}`);
      continue;
    }
    console.log(`~ ${user.email}: already exists — refreshing role/permissions`);
  }
  const { error: profileError } = await service
    .from("profiles")
    .update({
      full_name: user.name,
      role: user.role,
      permissions: user.permissions,
      must_change_password: false,
    })
    .eq("id", userId);
  console.log(profileError ? `! ${user.email}: ${profileError.message}` : `+ ${user.email} (${user.role})`);
}

// Notification routing is PER ROLE (notification_role_events); migration
// 0009 seeds sensible defaults for admin/manager/editor — nothing to do here.

if (withDemoData) {
  // Dates relative to "now" so the dashboard demo always has data this month.
  const today = new Date().toISOString().slice(0, 10);
  const DEMO_LEADS = [
    {
      form: "booking", locale: "en", full_name: "Demo Parent", email: "parent@example.com",
      phone: "+44 7700 900001", who_for: "Parent — for my child", pathway_interest: "British Education",
      preferred_format: "Online", message: "Demo enquiry: my daughter is in Year 5, we are considering 11+ preparation.",
      source: "google_search", programme: "11+", status: "assessment_booked",
      next_action: "Run the assessment call", next_action_date: today,
    },
    {
      form: "booking", locale: "ua", full_name: "Demo Student", email: "student@example.com",
      who_for: "Student", pathway_interest: "English Qualifications", preferred_format: "No preference",
      message: "Демо-заявка: готуюся до IELTS, потрібен бал 7.0 для університету.",
      source: "instagram", programme: "IELTS", status: "contacted",
      next_action: "Follow up about assessment slot", next_action_date: today,
    },
    {
      form: "partnership", locale: "en", full_name: "Demo Partner", email: "partner@example.com",
      subject: "Partnership", message: "Demo message: local college interested in collaboration.",
      source: "referral", status: "new",
    },
    {
      form: "booking", locale: "en", full_name: "Demo Enrolled", email: "enrolled@example.com",
      who_for: "Adult learner", pathway_interest: "Global Integration", preferred_format: "In person (Bedford)",
      source: "facebook_groups", programme: "General English", status: "enrolled",
    },
    {
      form: "booking", locale: "en", full_name: "Demo Lost", email: "lost@example.com",
      who_for: "Student", pathway_interest: "English Qualifications", preferred_format: "Online",
      source: "tiktok", programme: "GCSE", status: "lost",
      lost_reason: "timing", lost_reason_note: "Family travels until autumn.",
    },
  ].map((lead) => ({
    // PostgREST bulk inserts need identical keys on every row (missing keys
    // become NULL, not the column default) — normalise here.
    programme: "", next_action: "", next_action_date: null,
    lost_reason: null, lost_reason_note: "",
    ...lead,
  }));
  // Re-runs (seed-on-deploy) must not pile up duplicates: demo rows go in
  // only while the table is still empty.
  const { count: leadCount } = await service
    .from("leads")
    .select("id", { count: "exact", head: true });
  if (leadCount) {
    console.log(`~ leads: ${leadCount} already there — skipped`);
  } else {
    const { error: leadsError } = await service.from("leads").insert(DEMO_LEADS);
    console.log(leadsError ? `! leads: ${leadsError.message}` : `+ ${DEMO_LEADS.length} demo leads`);
  }

  const DEMO_REVIEWS = [
    {
      author_name: "Demo Parent",
      author_tag: "Parent of GCSE Student",
      quote: "Demo review awaiting moderation — approve or reject me in the admin panel.",
      source: "website",
      rating: 5,
      programme: "GCSE",
      audience: "parent",
    },
    {
      author_name: "Demo Google User",
      author_tag: "IELTS student",
      quote: "Demo imported review — this is how a review copied from Google looks.",
      source: "google",
      rating: 5,
      programme: "IELTS",
      audience: "student",
    },
    {
      // Approved + featured: this one feeds the homepage testimonials pool.
      author_name: "Demo Featured Parent",
      author_tag: "Parent of 11+ Student",
      quote: "Demo featured review — approved and marked as featured, so marketing shows it on the homepage.",
      source: "google",
      rating: 5,
      programme: "11+",
      audience: "parent",
      status: "approved",
      featured: true,
    },
  ].map((review) => ({ status: "pending", featured: false, ...review }));
  const { count: reviewCount } = await service
    .from("reviews")
    .select("id", { count: "exact", head: true });
  if (reviewCount) {
    console.log(`~ reviews: ${reviewCount} already there — skipped`);
  } else {
    const { error: reviewError } = await service.from("reviews").insert(DEMO_REVIEWS);
    console.log(reviewError ? `! reviews: ${reviewError.message}` : `+ ${DEMO_REVIEWS.length} pending reviews`);
  }

  const now = new Date().toISOString();
  const ARTICLES = [
    {
      slug: "uk-school-system-parents-guide", locale: "en", category: "uk-education",
      status: "published", published_at: now,
      author: "Demo Author, Education Lead",
      cta_label: "Explore British Education", cta_url: "/en/pathways/british-education",
      title: "Understanding the UK school system: a parent's guide",
      description: "Key stages, school years and the exams that matter — a clear map of the British school journey for families new to the system.",
      body_md: [
        "Moving through the British school system for the first time can feel like learning a new language of its own: key stages, SATs, GCSEs, sixth form. This short guide gives you the map.",
        "## The key stages at a glance",
        "- **Primary (ages 4–11):** Reception, then Years 1–6. SATs assessments close Year 6.",
        "- **Secondary (ages 11–16):** Years 7–9 build foundations; Years 10–11 are the GCSE years.",
        "- **Post-16 (ages 16–18):** A-Levels, BTEC, T-Levels or an apprenticeship.",
        "## The decisions that matter most",
        "The biggest choices arrive earlier than most families expect: selective school entry (the 11+) is prepared in Years 4–5, and GCSE subject choices in Year 9 shape what is possible at A-Level and university.",
        "If you are unsure where your child currently stands, a short assessment gives you a clear starting point — [book a free assessment](/en/book-assessment) and we will map the pathway together.",
      ].join("\n\n"),
    },
    {
      slug: "uk-school-system-parents-guide", locale: "ua", category: "uk-education",
      status: "published", published_at: now,
      author: "Demo Author, Education Lead",
      cta_label: "Дізнатися про британську освіту", cta_url: "/ua/pathways/british-education",
      title: "Британська шкільна система: путівник для батьків",
      description: "Key stages, шкільні роки та іспити, що справді важать, — зрозуміла мапа британської школи для родин, які щойно приїхали.",
      body_md: [
        "Розібратися в британській школі з першого разу непросто: key stages, SATs, GCSE, sixth form. Цей короткий путівник — ваша мапа.",
        "## Етапи навчання коротко",
        "- **Початкова школа (4–11 років):** Reception, далі Years 1–6. Наприкінці Year 6 — оцінювання SATs.",
        "- **Середня школа (11–16 років):** Years 7–9 закладають фундамент; Years 10–11 — роки GCSE.",
        "- **Post-16 (16–18 років):** A-Levels, BTEC, T-Levels або учнівство (Apprenticeship).",
        "## Рішення, які важать найбільше",
        "Найважливіші вибори настають раніше, ніж очікує більшість родин: до вступу в селективні школи (іспит 11+) готуються у Years 4–5, а вибір предметів GCSE у Year 9 визначає можливості на A-Level і в університеті.",
        "Якщо ви не впевнені, на якому етапі зараз ваша дитина, коротке оцінювання дасть чітку точку відліку — [запишіться на безкоштовне оцінювання](/ua/book-assessment), і ми складемо маршрут разом.",
      ].join("\n\n"),
    },
    {
      slug: "ielts-or-cambridge-which-exam", locale: "en", category: "english-qualifications",
      status: "published", published_at: now,
      title: "IELTS or Cambridge English: which exam do you actually need?",
      description: "University, visa or lifelong certificate? How IELTS and Cambridge English differ, and how to pick the exam that matches your goal.",
      body_md: [
        "Both IELTS and Cambridge English are respected worldwide — but they serve different goals, and picking the wrong one costs months of preparation.",
        "## Choose IELTS when…",
        "- You are applying to a university with a specific band-score requirement.",
        "- You need a UKVI-approved result for a **visa or immigration** application.",
        "- You need the result soon: IELTS runs frequently and scores arrive fast.",
        "## Choose Cambridge English when…",
        "- You want a certificate that is **valid for life**, not two years.",
        "- You are building long-term skills: B2 First and C1 Advanced reward real-world language, not exam technique alone.",
        "## The honest answer",
        "Start from the requirement, not the exam: check exactly what your university, employer or visa route accepts. Unsure? A short assessment settles it — [book yours here](/en/book-assessment).",
      ].join("\n\n"),
    },
    {
      slug: "ielts-or-cambridge-which-exam", locale: "ua", category: "english-qualifications",
      status: "published", published_at: now,
      title: "IELTS чи Cambridge English: який іспит вам насправді потрібен?",
      description: "Університет, віза чи безстроковий сертифікат? Чим відрізняються IELTS і Cambridge English та як обрати іспит під вашу мету.",
      body_md: [
        "IELTS і Cambridge English поважають у всьому світі — але вони служать різним цілям, і хибний вибір коштує місяців підготовки.",
        "## Обирайте IELTS, якщо…",
        "- Вступаєте до університету з конкретною вимогою до балів.",
        "- Потрібен схвалений UKVI результат для **візи чи імміграції**.",
        "- Результат потрібен швидко: IELTS складають часто, бали приходять швидко.",
        "## Обирайте Cambridge English, якщо…",
        "- Хочете сертифікат, **дійсний безстроково**, а не два роки.",
        "- Будуєте довгострокові навички: B2 First і C1 Advanced винагороджують живу мову, а не лише екзаменаційну техніку.",
        "## Чесна відповідь",
        "Відштовхуйтеся від вимоги, а не від іспиту: перевірте, що саме приймає ваш університет, роботодавець чи візовий маршрут. Вагаєтеся? Коротке оцінювання все розставить — [записатися тут](/ua/book-assessment).",
      ].join("\n\n"),
    },
    {
      slug: "first-months-in-uk-language-tips", locale: "en", category: "integration-uk",
      status: "published", published_at: now,
      title: "Your first months in the UK: language habits that actually help",
      description: "Practical, low-pressure ways to build English confidence while settling into British life — from GP calls to school gates.",
      body_md: [
        "The hardest conversations in a new country are rarely in the textbook: the GP receptionist, the school gate, the council phone line. Confidence there comes from habits, not grammar drills.",
        "## Five habits that work",
        "- **Script the routine calls.** Write three sentences before phoning the GP or council — then make the call.",
        "- **Pick one 'talking place'.** A cafe, a library group, a school-run chat: one place where you speak English every week.",
        "- **Learn the local words first.** Surgery, reception, year group, half term — daily-life vocabulary beats abstract word lists.",
        "- **Let mistakes be data.** Note what you could not say, and bring it to your next lesson.",
        "- **Keep your own language at home guilt-free.** Bilingual families integrate better, not worse.",
        "Our [Community Integration Programme](/en/pathways/global-integration) is built around exactly these situations.",
      ].join("\n\n"),
    },
    {
      slug: "first-months-in-uk-language-tips", locale: "ua", category: "integration-uk",
      status: "published", published_at: now,
      title: "Перші місяці у Великій Британії: мовні звички, що справді працюють",
      description: "Практичні способи без тиску розвинути впевненість в англійській, облаштовуючись у британському житті — від дзвінка до GP до шкільних воріт.",
      body_md: [
        "Найскладніші розмови в новій країні рідко бувають із підручника: реєстратура GP, шкільні ворота, телефонна лінія муніципалітету. Впевненість там дають звички, а не граматичні вправи.",
        "## П'ять звичок, що працюють",
        "- **Пишіть сценарій рутинних дзвінків.** Три речення перед дзвінком до GP чи council — і телефонуйте.",
        "- **Оберіть одне «місце розмови».** Кав'ярня, група в бібліотеці, розмова біля школи: одне місце, де ви щотижня говорите англійською.",
        "- **Спершу вчіть місцеві слова.** Surgery, reception, year group, half term — лексика щоденного життя важливіша за абстрактні списки.",
        "- **Хай помилки стануть даними.** Занотуйте, що не змогли сказати, і принесіть на наступний урок.",
        "- **Вдома говоріть рідною без провини.** Двомовні родини інтегруються краще, а не гірше.",
        "Наша [програма Community Integration](/ua/pathways/global-integration) побудована саме навколо таких ситуацій.",
      ].join("\n\n"),
    },
    {
      slug: "gcse-revision-plan-that-works", locale: "en", category: "uk-education",
      status: "draft", published_at: null,
      title: "A GCSE revision plan that actually works (draft)",
      description: "Draft: spaced repetition, past papers and realistic weekly targets — a revision structure students stick to.",
      body_md: "## Draft\n\nEdit this draft in the admin panel and publish it to see the full flow: draft → publish → live on the site within seconds.",
    },
    {
      // Builder v2 demo: layout blocks (body_blocks) drive the rendering —
      // wide/full widths, columns, buttons, captions. body_md is the flat mirror.
      slug: "layout-showcase-what-the-builder-can-do", locale: "en", category: "integration-uk",
      status: "published", published_at: now,
      author: "Demo Author, Education Lead",
      title: "Layout showcase: what the post builder can do",
      description: "A demo article using the layout builder: wide and full-width blocks, side-by-side columns, buttons, captions and dividers.",
      body_blocks: [
        { kind: "p", text: "This article is built with the layout constructor: every block chooses its own width and alignment, and content can sit side by side in columns. Edit it in the admin panel to see how each piece is assembled." },
        { kind: "h2", text: "A wide, centered heading", width: "wide", align: "center" },
        { kind: "p", text: "The heading above uses the wide width; this paragraph is the standard reading column. Mixing widths gives articles rhythm without any custom code.", },
        { kind: "columns", width: "wide", columns: [
          [
            { kind: "h3", text: "Left column" },
            { kind: "p", text: "Columns hold any simple blocks: text, headings, lists, quotes, images and buttons. On phones they stack vertically." },
            { kind: "ul", items: ["Two or three columns", "Per-block alignment", "Stacks on mobile"] },
          ],
          [
            { kind: "quote", text: "Put a testimonial next to the argument it supports — the reader sees both at once." },
            { kind: "button", label: "Book a free assessment", href: "/en/book-assessment", align: "center" },
          ],
        ] },
        { kind: "divider", width: "wide" },
        { kind: "p", text: "**Full-width blocks** run edge to edge — useful for panoramic images or a visual break between chapters.", align: "center" },
        { kind: "spacer", size: "m" },
        { kind: "p", text: "And when the article is done, the end-of-article CTA hands the reader to a programme page as usual." },
      ],
      body_md: [
        "This article is built with the layout constructor: every block chooses its own width and alignment, and content can sit side by side in columns. Edit it in the admin panel to see how each piece is assembled.",
        "## A wide, centered heading",
        "The heading above uses the wide width; this paragraph is the standard reading column. Mixing widths gives articles rhythm without any custom code.",
        "### Left column",
        "Columns hold any simple blocks: text, headings, lists, quotes, images and buttons. On phones they stack vertically.",
        "- Two or three columns\n- Per-block alignment\n- Stacks on mobile",
        "> Put a testimonial next to the argument it supports — the reader sees both at once.",
        "[Book a free assessment](/en/book-assessment)",
        "**Full-width blocks** run edge to edge — useful for panoramic images or a visual break between chapters.",
        "And when the article is done, the end-of-article CTA hands the reader to a programme page as usual.",
      ].join("\n\n"),
    },
    {
      // Scheduled demo: goes live by itself once the time passes (ISR).
      slug: "scheduled-post-demo", locale: "en", category: "boarding-schools",
      status: "scheduled",
      published_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Demo Author, Education Lead",
      title: "Choosing a boarding school: a scheduled demo post",
      description: "Demo of scheduled publishing — this article is queued and appears on the site automatically at its publication time.",
      body_md: "## Scheduled\n\nThis post was seeded with a publication time two days in the future. Change the schedule (or publish now) in the admin panel.",
    },
  ];

  let seeded = 0;
  for (const article of ARTICLES) {
    const { error } = await service
      .from("posts")
      .upsert(article, { onConflict: "slug,locale" });
    if (error) console.log(`! post ${article.slug}/${article.locale}: ${error.message}`);
    else seeded += 1;
  }
  console.log(`+ ${seeded} posts (6 published EN/UA + 1 layout demo + 1 draft + 1 scheduled)`);
} else {
  console.log("~ demo data skipped (SEED_DEMO_DATA=0)");
}

console.log("");
console.log(
  adminEmail
    ? `Done. Sign in at /admin as ${adminEmail}.`
    : `Done. Sign in at /admin with e.g. admin@mugup.local / ${DEMO_PASSWORD}`,
);
