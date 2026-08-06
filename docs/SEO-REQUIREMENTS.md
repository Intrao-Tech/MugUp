# SEO Requirements — mugupstudio.com

Hard requirements for the MugUp build, baked in from day one — **not** a post-launch cleanup task.
Source: an SEO specialist's audit of another Lovable-built JS site (angl-consulting.com). Every problem
found there is something this build must never have. Original audit questions preserved at the bottom.

## Build requirements

1. **Static/server rendering.** All key pages (Home, About, Pathways hub + every programme sub-page,
   Insights listing + articles, Book Assessment) must be statically generated or server-rendered.
   Core text content must be present in the initial HTML response — never client-only rendered.
2. **Unique `<title>` + meta description per page.** No shared/global defaults leaking onto real pages.
   Insights articles get their title/description from the article itself (admin editor must have fields for these).
3. **Canonical tag on every page** (self-referencing by default).
4. **Real 404s.** Unknown URLs return HTTP 404 (+ proper not-found page). No soft-200s.
5. **`sitemap.xml`** auto-generated (including published Insights articles) and referenced from `robots.txt`.
6. **Languages.** mugupstudio.com is planned EN-only; the Ukrainian audience stays on mugup.com.ua
   (linked from Modern Languages section). If a second language is ever added: separate URL prefix
   (`/ua/…`) + `hreflang` pairs — never a client-side-only switcher on one URL.
7. **Human-readable slugs.** `/pathways/british-education/gcse`, `/insights/choosing-11-plus-school` —
   never index-based IDs like `/services/0-0`. Insights slugs editable in admin, unique, kebab-case.
8. **Exactly one H1 per page**, logical H2/H3 hierarchy, semantic landmarks (`header/nav/main/footer`).
9. **JSON-LD structured data:**
   - `EducationalOrganization` (or `LocalBusiness`) site-wide — name, logo, address
     (66–68 St Loyes St, Bedford MK40 1EZ), sameAs social links;
   - `Service` on programme sub-pages;
   - `Article` on Insights posts;
   - `FAQPage` on Book Assessment (it has an FAQ section);
   - `BreadcrumbList` on nested pages.
10. **OG/social.** `og:image` hosted on our own domain (never a temp/preview domain), full OG + Twitter
    card tags per page.

## Baseline from the TZ (Clause 6.6)

- Technical SEO baseline (everything above), GA4 + Search Console setup.
- Cookie consent banner (see cookie stance in the July 2026 explainer: strictly-necessary only at launch;
  banner required once GA4/tracking goes live).
- SSL/TLS, access controls, anti-spam on both forms.
- Latest two versions of Chrome/Safari/Edge/Firefox; responsive desktop/tablet/mobile.

## Original audit questions (verbatim, UA)

1. Сайт повністю на JS. Чи можлива статична генерація основних текстових блоків для ключових сторінок?
2. Title і meta description однакові на всіх сторінках сайту (головна, /services, картки послуг, /contact, /resources). Чи можна буде зробити унікальні для кожної сторінки?
3. На сторінках немає canonical-тегів. Чи можна додати?
4. Неіснуючі URL (наприклад, випадковий /random-page) віддають HTTP 200 замість 404. Чи можна виправити коди відповіді?
5. Чи можна згенерувати робочий sitemap і додати посилання на нього в robots.txt?
6. Перемикач мов (UA/EN/RU) міняє лише візуальний стан, а не URL — окремих адрес для мовних версій немає, hreflang відсутній. Чи планується розводити мови по окремих URL (/en/, /ru/)?
7. URL послуг мають вигляд /services/0-0, /services/1-2. Чи можна змінити на ЧПУ?
8. На сторінках /resources немає жодного H1. Чи можна додати?
9. Чи є можливість додати структуровані дані (JSON-LD, схема Organization/LocalBusiness/Service) на сторінки?
10. og:image для соцмереж зараз веде на тимчасовий preview-домен Lovable (r2.dev). Чи можна замінити на власне зображення на домені angl-consulting.com?
