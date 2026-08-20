import type { Page } from "@/content/types";

// Copy source: client doc "About sеction.docx" (verbatim where provided).
export const page: Page = {
  meta: {
    title: "About Us | Mug.Up Language Studio",
    description:
      "The story, mission, values and people of Mug.Up Language Studio — qualified educators, professional standards and partnerships supporting learners in the UK.",
  },
  hero: {
    title: "More Than Education. More Than Language.",
    body: [
      "Mug.Up was founded on a simple belief: education should create opportunities.",
      "Today, we support children, teenagers, adults, and families as they navigate educational pathways, build confidence, develop practical skills, and create meaningful opportunities for the future.",
      "What started as language learning support has evolved into an international education platform helping learners succeed in education, work, and life in the UK and beyond.",
      "Our role is not simply to teach. Our role is to help people move forward.",
    ],
  },
  sections: [
    {
      id: "mission-values",
      title: "Mission & Values",
      intro: "At Mug.Up Language Studio, we believe that education has the power to transform lives.",
      blocks: [
        { type: "lead", text: "Education. Integration. Opportunities." },
        {
          type: "paragraph",
          text: "Our mission is to help children, teenagers, adults, and families unlock their full potential through education, language learning, and the development of practical skills needed for academic success, professional achievement, and confident participation in an international environment.",
        },
        {
          type: "paragraph",
          text: "We believe that language is not the final goal. It is a powerful tool that opens doors to education, career development, international communication, and personal growth.",
        },
        {
          type: "paragraph",
          text: "Through personalised learning pathways, academic support, and practical guidance, we help learners build confidence, create opportunities, and achieve meaningful outcomes.",
        },
        {
          type: "cards",
          cards: [
            { title: "Academic Excellence" },
            { title: "Practical Outcomes" },
            { title: "Personalised Approach" },
            { title: "Support & Partnership" },
            { title: "Continuous Development" },
            { title: "Global Mindset" },
          ],
        },
      ],
    },
    {
      id: "philosophy-methodology",
      title: "Philosophy & Methodology",
      intro: "Unlocking Human Potential Through Education",
      blocks: [
        {
          type: "paragraph",
          text: "We believe that education should prepare people not only for examinations, but for life.",
        },
        {
          type: "paragraph",
          text: "Success in today's world requires more than knowledge. It requires confidence, adaptability, communication skills, cultural awareness, and the ability to navigate change.",
        },
        {
          type: "paragraph",
          text: "Every learner arrives with different experiences, ambitions, and challenges. Our role is to help identify opportunities, build a clear pathway forward, and provide support at every stage of the journey.",
        },
        {
          type: "paragraph",
          text: "We are committed to helping learners become confident, capable, and globally minded individuals who are prepared to thrive in education, work, and international environments.",
        },
        { type: "lead", text: "Our Approach: Learn. Adapt. Grow. Achieve." },
        {
          type: "paragraph",
          text: "Language learning is only the beginning. Real opportunities emerge when language becomes a tool for education, integration, career growth, and personal development.",
        },
        {
          type: "paragraph",
          text: "That is why we do more than teach English. We help learners understand and navigate the British educational and professional environment while developing the confidence and practical skills needed for long-term success.",
        },
        {
          type: "cards",
          cards: [
            {
              title: "Personalised Learning",
              body: "Every learner follows a pathway designed around their goals, strengths, and aspirations.",
            },
            {
              title: "Academic Excellence",
              body: "Our programmes combine high-quality teaching, structured learning, and measurable outcomes.",
            },
            {
              title: "Practical Application",
              body: "Learning is connected to real-life situations, educational success, and workplace communication.",
            },
            {
              title: "Growth Mindset",
              body: "We encourage resilience, independence, curiosity, and continuous improvement.",
            },
            {
              title: "Partnership with Families",
              body: "We work closely with parents and learners to support progress and long-term success.",
            },
          ],
        },
      ],
    },
    {
      id: "supporting-families",
      title: "Supporting Families New to the UK",
      intro: "Relocating to a new country can be exciting—but also challenging.",
      blocks: [
        {
          type: "paragraph",
          text: "We support children, adults, and families as they adapt to the British educational system, improve language skills, understand available opportunities, and build confidence in their new environment.",
        },
        {
          type: "list",
          items: [
            "School admissions guidance",
            "Educational pathways",
            "SATs, 11+, GCSE / IGCSE, A-Levels, Cambridge English Qualifications, IELTS / IELTS UKVI, SELT",
            "College and university preparation and application support",
            "Language integration",
            "Career development support",
            "Confidence building for life in the UK",
          ],
        },
      ],
    },
    {
      id: "founder-story",
      title: "Founder Story",
      intro:
        "Meet Ievgeniia Angerchik, PhD, CELTA — Founder & Director | Education Expert | Language Learning Consultant",
      blocks: [
        {
          type: "paragraph",
          text: "Having worked extensively with international learners, migrant families, and students from diverse educational backgrounds, I repeatedly encountered the same challenge: people were learning English, but they often lacked the guidance, confidence, and understanding needed to fully access educational and professional opportunities.",
        },
        { type: "paragraph", text: "I founded Mug.Up to bridge that gap." },
        {
          type: "paragraph",
          text: "Today, we help learners not only develop language skills, but also navigate educational pathways, prepare for internationally recognised qualifications, integrate into new environments, and build successful futures.",
        },
        {
          type: "paragraph",
          text: "I firmly believe that every learner has potential. Sometimes all they need is the right support, the right environment, and someone who believes in them.",
        },
        { type: "image", alt: "Founder video" },
        {
          type: "paragraph",
          text: "Hello, I'm Ievgeniia Angerchik, Founder and Director of Mug.Up. People often ask me why I created Mug.Up. The answer is simple.",
        },
        {
          type: "paragraph",
          text: "Over the years, I worked with many international students, migrant families, and learners adapting to new educational systems and cultures. What I saw again and again was that language was rarely the biggest challenge. The real challenge was confidence. Understanding how the education system works. Knowing which opportunities are available. Feeling capable of taking the next step.",
        },
        {
          type: "paragraph",
          text: "Many learners needed more than lessons. They needed guidance, encouragement, and someone who could help them navigate their journey. That is why I created Mug.Up. A place where education goes beyond language learning and becomes a pathway to opportunity.",
        },
        {
          type: "paragraph",
          text: "Today, we help children, teenagers, adults, and families build confidence, achieve academic success, integrate into life in the UK, and create new opportunities for their future.",
        },
        {
          type: "paragraph",
          text: "What inspires me most is seeing our learners grow—not only in their knowledge and skills, but in their belief in themselves.",
        },
        {
          type: "paragraph",
          text: "Thank you for being here. We would be delighted to be part of your journey. Education. Integration. Opportunities.",
        },
      ],
    },
    {
      id: "our-educators",
      title: "Our Educators",
      intro:
        "Expertise That Makes a Difference. Behind every successful learner is a dedicated educator. Our team combines British-qualified teachers, native English-speaking tutors, academic specialists, and international education professionals who share a commitment to high-quality teaching and meaningful outcomes.",
      blocks: [
        {
          type: "list",
          items: [
            "PGCE Qualified Educators",
            "CELTA Certified Teachers",
            "Cambridge-Educated Specialists",
            "IELTS & Exam Preparation Experts",
            "British Curriculum Specialists",
            "Experienced Academic Tutors",
          ],
        },
        {
          type: "paragraph",
          text: "Together, they bring extensive experience supporting learners from diverse backgrounds and educational systems.",
        },
        {
          type: "team",
          members: [
            {
              name: "Ievgeniia Angerchik, PhD, CELTA",
              photo: "/images/team/ievgeniia.jpg",
              role: "Founder & Director | Education Consultant",
              bio: "Founder of Mug.Up Language Studio Ltd, education expert, and language learning consultant with extensive experience supporting learners, families, and migrants in achieving their academic, professional, and integration goals. Specialising in GCSE, IELTS, ESOL, and SELT preparation, Ievgeniia helps students develop language confidence, navigate educational pathways, and successfully adapt to life and learning in the UK.",
            },
            {
              name: "Ally Zomkowski, PGCE, CELTA",
              role: "Academic Coordinator | IELTS & English Specialist",
              bio: "Qualified British teacher with PGCE and CELTA qualifications. Specialist in IELTS preparation, GCSE programmes, Business English, Workplace English, and UK integration support.",
              photo: "/images/team/ally.png",
            },
            {
              name: "Gabi",
              role: "English Language, English Literature & Humanities Teacher",
              credentials: "Qualified Teacher | 10+ Years Teaching Experience (UK & International Schools)",
              bio: "Gabi specialises in English Language, English Literature, Humanities, Key Stage 3 and GCSE programmes. She has extensive experience supporting students from diverse backgrounds, including learners for whom English is an additional language.",
              photo: "/images/team/gabi.jpg",
            },
            {
              name: "Luisa Deragon, PhD",
              role: "English Language Tutor",
              credentials: "PhD, University of Cambridge | Cambridge-Educated Tutor",
              bio: "Fluent in English, Portuguese, and Spanish, Luisa specialises in 11+ preparation, ESL support, academic skills development, and general English. Her international experience supporting students across the UK, US, and Canada allows her to create highly personalised learning programmes.",
              photo: "/images/team/luisa.jpeg",
            },
            {
              name: "Anca Maria Gherghel",
              role: "Business, Finance & Mathematics Specialist",
              credentials: "Senior Research Manager | PhD Researcher",
              bio: "Anca specialises in Business, Finance, Mathematics, Analytical Thinking, and Financial Education. She combines academic research with practical expertise, helping students develop strong analytical skills, logical reasoning, and confidence in applying knowledge to real-world situations.",
              photo: "/images/team/anca.jpg",
            },
            {
              name: "Samuel Dicks",
              role: "Chemistry & STEM Tutor",
              credentials:
                "MChem (Hons) Chemistry with International Study, First-Class Honours, The University of Manchester | PhD Offer Holder in Atomic & Laser Physics, University of Oxford",
              bio: "Samuel specialises in 11+ Mathematics, GCSE and A-Level Chemistry, Physics and Mathematics, helping students develop strong subject knowledge, confidence and effective exam techniques. His structured, exam-focused lessons combine clear explanations with practical problem-solving strategies.",
              photo: "/images/team/sam.jpeg",
            },
            {
              name: "Saffron George",
              role: "Primary & 11+ Tutor | Spanish Language Tutor",
              credentials: "Qualified Teacher (QTS, PGCE)",
              bio: "Saffron is a qualified primary school teacher specialising in Primary English and Maths, 11+ preparation, and Spanish GCSE. As a fluent Spanish speaker, she combines strong subject knowledge with a supportive and engaging teaching style.",
              photo: "/images/team/saffron.jpeg",
            },
            {
              name: "Djennè Stephens",
              photo: "/images/team/djenne.jpg",
              role: "GCSE English | Functional Skills | ESOL",
              credentials:
                "Qualified Further Education English Lecturer | CELTA Qualified | PGCE in Progress",
              bio: "Djennè specialises in GCSE English, Functional Skills English and ESOL, working with children, young people and adults. She holds a First Class BA (Hons) in Childhood and Youth Studies with Psychology and has experience supporting learners with SEND, GCSE resits and English as an additional language. Her teaching combines academic progress with confidence-building through engaging, personalised lessons.",
            },
            {
              name: "Tetiana Krytsun",
              photo: "/images/team/tetiana.jpg",
              role: "Manager of Mug.Up Studio | Educational Consultant",
              credentials:
                "Master of Arts in Laws, Master of Arts in International Criminology | PhD candidate",
              bio: "Tetiana is the Manager of Mug.Up Studio, overseeing operations and strategic development. As an Educational Consultant, she supports students and families in making confident academic choices and achieving their goals. With advanced degrees in Law and International Criminology and pursuing a PhD, Tetiana combines analytical expertise, leadership and a passion for education to help students succeed.",
            },
          ],
        },
      ],
    },
    {
      id: "professional-standards",
      title: "Qualifications That Build Trust",
      intro: "We believe that exceptional learning experiences begin with exceptional educators.",
      blocks: [
        {
          type: "paragraph",
          text: "Our teaching team holds internationally recognised qualifications and advanced academic credentials, including:",
        },
        {
          type: "list",
          items: [
            "PhD Qualifications",
            "CELTA Certification",
            "PGCE Qualifications",
            "British Curriculum Expertise",
            "IELTS & Examination Specialisation",
            "Continuous Professional Development",
          ],
        },
        {
          type: "paragraph",
          text: "These qualifications reflect our commitment to maintaining the highest standards of teaching, learner support, and educational excellence.",
        },
      ],
    },
    {
      id: "partnerships",
      title: "Partnerships & Collaboration",
      intro: "Creating Opportunities Together",
      blocks: [
        {
          type: "paragraph",
          text: "Education does not exist in isolation. We work alongside educational institutions, community organisations, professional service providers, and local businesses that share our commitment to learning, inclusion, and personal development.",
        },
        {
          type: "paragraph",
          text: "These collaborations help us provide broader support for learners and families, connecting education with real-world opportunities and community engagement.",
        },
        {
          type: "paragraph",
          text: "Through partnership, we strengthen the learning experience and create meaningful pathways for future success.",
        },
      ],
    },
    {
      id: "final-cta",
      blocks: [
        {
          type: "cta",
          title: "Every Opportunity Starts with the Right Guidance",
          body: "Whether you are preparing for examinations, exploring educational pathways, developing professional skills, or building a future in the UK, we are here to help. Book a Personal Assessment and receive expert guidance tailored to your goals, ambitions, and individual circumstances.",
          note: "Your assessment includes: personal consultation, educational pathway recommendations, skills and needs review, clear next steps. No obligation.",
          cta: { label: "Book Your Assessment", href: "/book-assessment" },
        },
      ],
    },
  ],
};
