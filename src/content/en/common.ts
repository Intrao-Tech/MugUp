import type { CommonDict } from "@/content/types";

export const common: CommonDict = {
  siteName: "Mug.Up Language Studio",
  nav: {
    home: "Home",
    about: "About",
    pathwaysBritish: "British Education",
    pathwaysGlobal: "Global Integration",
    courses: "Courses & Programmes",
    insights: "Insights",
    bookAssessment: "Book Assessment",
    contact: "Contact",
  },
  footer: {
    tagline: "Education. Integration. Opportunities.",
    groups: [
      {
        title: "Pathways",
        links: [
          { label: "Mug.Up Britain", href: "/pathways/british-education" },
          { label: "Mug.Up Global Integration", href: "/pathways/global-integration" },
          { label: "Languages", href: "https://mugup.com.ua" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Insights", href: "/insights" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "Contact", href: "/contact" },
          { label: "Book Assessment", href: "/book-assessment" },
          { label: "Leave a review", href: "/review" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Terms & Conditions", href: "/terms" },
        ],
      },
    ],
    contactHeading: "Contact Information",
    addressLabel: "Learning Centre Address",
    followHeading: "Follow Us",
  },
  ui: {
    skipToContent: "Skip to content",
    openMenu: "Menu",
    breadcrumbsHome: "Home",
    atAGlance: "At a Glance",
    explore: "Explore",
    readMore: "Read more",
    allCategories: "All categories",
    postedIn: "Posted in",
    samplePostNotice: "Sample article — placeholder content, will be replaced before launch.",
    formNotWired: "The form backend is not connected yet — submissions are disabled at this stage.",
    localeSwitchLabel: "Site language",
    imagePlaceholder: "Image placeholder",
    stage2Notice: "Full programme pages arrive in Stage 2.",
    formSent: "Thank you — your message has been sent. We will get back to you shortly.",
    formError: "Something went wrong and the message was not sent. Please check the fields and try again.",
    meetFullTeam: "Meet the full team on the About page",
  },
};
