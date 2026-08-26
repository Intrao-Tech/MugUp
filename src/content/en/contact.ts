import type { FormPage } from "@/content/types";

// No client source doc — concise professional copy drafted for launch.
export const page: FormPage = {
  meta: {
    title: "Contact Us | Mug.Up",
    description:
      "Get in touch with Mug.Up Language Studio in Bedford. Ask about programmes, pricing or partnerships, or visit our learning centre at 66–68 St Loyes Street.",
  },
  hero: {
    title: "Contact Us",
    subtitle: "We're here to answer your questions and help you take the next step.",
    body: [
      "Whether you have a question about our programmes, want to discuss the right pathway for your family, or are interested in working with us, we would love to hear from you.",
    ],
  },
  sections: [
    {
      id: "contact-details",
      title: "Visit or Get in Touch",
      blocks: [
        {
          type: "paragraph",
          text: "Our learning centre is located at 66–68 St Loyes St, Bedford MK40 1EZ, a short walk from Bedford town centre. You are welcome to visit us in person or reach out online — we usually reply within one working day.",
        },
        {
          type: "paragraph",
          text: "You can also follow Mug.Up Language Studio on our social channels for news, learning tips, and updates from our community.",
        },
      ],
    },
  ],
  form: {
    title: "Send Us a Message",
    intro: "Fill in the form below and we will get back to you as soon as possible.",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email", required: true },
      { name: "phone", label: "Phone Number", type: "tel" },
      {
        name: "subject",
        label: "Subject",
        type: "select",
        options: [
          "Courses & Programmes",
          "Pricing & Payment",
          "Book an Assessment",
          "Exams & Qualifications",
          "British Education",
          "International Education",
          "Corporate & Business Enquiries",
          "Partnerships & Collaboration",
          "Existing Student Support",
          "General Enquiry",
          "Other",
        ],
      },
      {
        name: "source",
        label: "How did you hear about us?",
        type: "select",
        options: [
          "Google Search",
          "Instagram",
          "Facebook",
          "TikTok",
          "Telegram",
          "Recommendation from friends or family",
          "Event",
          "Flyer",
          "School",
          "Partner organisation",
          "Facebook group",
          "Other",
        ],
      },
      {
        name: "message",
        label: "Your Message",
        type: "textarea",
        required: true,
      },
      {
        name: "attachment",
        label: "Attachment",
        type: "file",
        hint: "Optional — attach a file if it helps explain your enquiry.",
      },
      {
        name: "consent",
        label:
          "I consent to Mug.Up Language Studio storing and processing the information provided in this form in order to respond to my enquiry, in line with the Privacy Policy.",
        type: "checkbox",
        required: true,
      },
    ],
    submitLabel: "Send Message",
    disabledNote:
      "The form backend is not connected yet — submissions are disabled at this stage.",
  },
};
