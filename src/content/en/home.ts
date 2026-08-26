import type { Page } from "@/content/types";

// Copy source: client doc "Hеro page.docx" (verbatim where provided).
export const page: Page = {
  meta: {
    title: "Mug.Up Language Studio — Education Pathways in the UK",
    description:
      "International education platform supporting children, teenagers, adults and families through British education, exam preparation, integration and career development.",
  },
  hero: {
    title: "Education Pathways for Life in the UK and Beyond",
    subtitle:
      "Supporting children, teenagers, adults, and families through education, integration, and career development.",
    body: [
      "Mug.Up is an international education platform helping learners build confidence, navigate educational pathways, and unlock opportunities in the UK and beyond.",
      "Whether you are preparing for examinations, pursuing higher education, developing professional skills, or adapting to life in a new country, we provide expert guidance and personalised support every step of the way.",
    ],
    ctas: [{ label: "Get Expert Guidance", href: "/book-assessment" }],
  },
  sections: [
    {
      id: "what-we-support",
      title: "What We Support",
      blocks: [
        {
          type: "list",
          items: [
            "Educational Pathways",
            "Exam Preparation & Academic Success",
            "UK Integration Support",
            "Professional & Career Development",
            "Online & In-Person Learning",
          ],
        },
        {
          type: "cta",
          title: "Start with a Personal Assessment",
          body: "Receive tailored recommendations and a clear pathway based on your goals and aspirations.",
          cta: { label: "Get Expert Guidance", href: "/book-assessment" },
        },
      ],
    },
    {
      id: "choose-your-path",
      title: "Find the Right Pathway for Your Goals",
      intro: "Every learner's journey is different. Choose the pathway that best matches your ambitions.",
      blocks: [
        {
          type: "cards",
          cards: [
            {
              title: "Mug.Up Britain",
              body: "Supporting children, teenagers and families through every stage of the British education journey. Helping learners build strong academic foundations, achieve success in British qualifications, and confidently progress from primary education to university and beyond.",
              items: [
                "British Education Pathways",
                "SATs, 11+, GCSE & A-Level Support",
                "Post-16 Education",
                "UK University Preparation",
                "Career & Beyond",
              ],
              image: "placeholder",
              href: "/pathways/british-education",
              linkLabel: "Explore British Education",
            },
            {
              title: "Mug.Up Global Integration",
              body: "Helping individuals and families build confidence, develop practical communication skills, and create new opportunities in the UK and beyond. From everyday life and professional communication to multilingual learning and international education, our personalised programmes support integration, career development, academic progression, and lifelong learning.",
              items: [
                "Foreign Language Programmes",
                "Relocation & Integration",
                "Workplace & Professional Communication",
                "Business & Industry-Specific Language",
                "International Language Qualifications",
                "International Education & Study Abroad",
              ],
              image: "placeholder",
              href: "/pathways/global-integration",
              linkLabel: "Explore Global Integration",
            },
          ],
        },
      ],
    },
    {
      id: "how-it-works",
      title: "A Clear Pathway to Success",
      intro: "We make the learning journey simple, structured, and focused on outcomes.",
      blocks: [
        {
          type: "steps",
          steps: [
            { title: "Assess", body: "We evaluate your current level, learning needs, and future goals." },
            { title: "Plan", body: "We create a personalised pathway with clear recommendations and milestones." },
            { title: "Learn", body: "Students work with experienced tutors through structured programmes and practical activities." },
            { title: "Track Progress", body: "Regular reviews and feedback ensure continuous improvement." },
            { title: "Achieve", body: "Students reach educational, language, and professional goals." },
            { title: "Grow", body: "We continue supporting long-term development, confidence, and future success." },
          ],
        },
      ],
    },
    {
      id: "results",
      title: "Real Results. Real Progress. Real Opportunities.",
      intro:
        "Success is measured not only by exam scores but by the opportunities that follow. Our students achieve meaningful outcomes through personalised support, structured learning pathways, and expert guidance.",
      blocks: [
        {
          type: "stats",
          stats: [
            { value: "15+", label: "Years of Educational Experience" },
            { value: "250+", label: "Supported learners" },
            { value: "60%", label: "of Students Study with Us for 12+ Months" },
            { value: "82%", label: "of students achieved or exceeded their predicted GCSE grades" },
          ],
        },
        {
          type: "list",
          items: [
            "Higher exam scores and qualifications",
            "Successful SATs, 11+, GCSE and IELTS outcomes",
            "Admissions to UK schools, colleges and universities",
            "Improved confidence and communication skills",
            "Career progression and professional development",
            "Successful adaptation to life and education in the UK",
          ],
        },
        {
          type: "testimonials",
          items: [
            {
              quote:
                "We would like to thank Mug.Up Language Studio and Anastasiia for their support and dedication. Over this period, Tykhomyr has made remarkable progress. His English grades at school have improved significantly, and we can clearly see the positive impact of the lessons. We are delighted with the results and highly recommend Mug.Up to other families.",
              author: "Parent of Secondary School Student",
              tag: "Academic Progress",
            },
            {
              quote:
                "We would like to sincerely thank Ievgeniia and the entire Mug.Up team for their professionalism, patience, and support. They made our learning journey both comfortable and enjoyable. Our children genuinely loved the lessons and always looked forward to the next one. We highly recommend Mug.Up to families seeking quality education and genuine care.",
              author: "Parent of Two Students",
              tag: "Caring and Supportive Environment",
            },
            {
              quote:
                "We are extremely pleased with the progress achieved through Mug.Up. Our children genuinely enjoy their lessons and have built wonderful relationships with their teachers. The encouragement, professionalism, and personal approach of the team have made a real difference to their confidence and learning journey.",
              author: "Parent, Mug.Up Britain Programme",
              tag: "Student Engagement & Confidence",
            },
            {
              quote:
                "My daughter recently took a school assessment and achieved a Grade 8 in topics she had been studying during her lessons at Mug.Up over the previous six weeks. It was fantastic to see her hard work and preparation pay off. We are absolutely delighted with the result.",
              author: "Parent of GCSE Student",
              tag: "GCSE Success Story — Grade 8 Achievement",
            },
          ],
        },
        {
          type: "cta",
          title: "Have you studied with us?",
          body: "Share your experience — your review helps other families and learners take their first step.",
          cta: { label: "Leave a review", href: "/review" },
        },
      ],
    },
        {
      id: "for-parents",
      title: "Supporting Your Child's Success with Confidence",
      intro:
        "Choosing the right educational support can be challenging. We help parents make informed decisions and ensure every child receives personalised guidance and attention.",
      blocks: [
        {
          type: "list",
          items: [
            "Personalised learning plans",
            "Small groups and individual support",
            "Regular progress tracking and feedback",
            "Experienced and qualified tutors",
            "Clear educational pathways",
            "Safe, supportive learning environment",
          ],
        },
        {
          type: "paragraph",
          text: "We work closely with families to ensure students remain motivated, engaged, and confident throughout their learning journey.",
        },
      ],
    },
    {
      id: "why-mugup",
      title: "More Than Language. More Than Education.",
      intro:
        "At Mug.Up, we believe that learning should create opportunities. Language is not the final destination—it is the foundation for academic achievement, professional growth, successful integration, and personal development.",
      blocks: [
        {
          type: "paragraph",
          text: "Our approach combines education, practical skills, and personalised guidance to help learners achieve meaningful outcomes at every stage of life.",
        },
        {
          type: "list",
          items: [
            "Education and integration under one roof",
            "Expertise in British education, integration, and international pathways",
            "Highly qualified educators with extensive experience supporting multilingual learners and students from diverse educational backgrounds",
            "Native English-speaking and international teaching professionals",
            "Personalised learning journeys designed around each learner's goals and potential",
            "Academic excellence combined with practical, real-world outcomes",
            "Long-term support for education, career development, and successful integration",
            "A human-centred approach focused on confidence, opportunity, and growth",
          ],
        },
      ],
    },
    {
      id: "meet-our-team",
      title: "Meet Our Team",
      intro:
        "Our team combines experienced educators, native English-speaking tutors, and international professionals who are passionate about helping learners succeed. Together, we support children, teenagers, adults, and families through every stage of their educational journey.",
      blocks: [
        {
          type: "team",
          members: [
            {
              name: "Ievgeniia Angerchik",
              photo: "/images/team/ievgeniia.jpg",
              role: "Founder & Director | Educational Consultant",
              bio: "Founder of Mug.Up Language Studio Ltd, education expert, and language learning consultant with extensive experience supporting learners, families, and migrants in achieving their academic, professional, and integration goals. Specialising in GCSE, IELTS, ESOL, and SELT preparation, Ievgeniia helps students develop language confidence, navigate educational pathways, and successfully adapt to life and learning in the UK.",
            },
            {
              name: "Ally Zomkowski",
              role: "Academic Coordinator",
              bio: "Qualified British teacher with PGCE and CELTA qualifications. Specialist in IELTS preparation, GCSE programmes, Business English, Workplace English, and UK integration support.",
              photo: "/images/team/ally.png",
            },
            {
              name: "Tetiana Krytsun",
              photo: "/images/team/tetiana.jpg",
              role: "Studio Manager & Educational Consultant",
              credentials:
                "Master of Arts in Laws, Master of Arts in International Criminology | PhD candidate",
              bio: "Tetiana is the Manager of Mug.Up Studio, overseeing operations and strategic development. As an Educational Consultant, she supports students and families in making confident academic choices and achieving their goals. With advanced degrees in Law and International Criminology and pursuing a PhD, Tetiana combines analytical expertise, leadership and a passion for education to help students succeed.",
            },
            {
              name: "Gabi Rodgers",
              role: "English Language & Literature Teacher",
              credentials: "Qualified Teacher | 10+ Years Teaching Experience (UK & International Schools)",
              bio: "Gabi specialises in English Language, English Literature, Humanities, Key Stage 3 and GCSE programmes. She has extensive experience supporting students from diverse backgrounds, including learners for whom English is an additional language.",
              photo: "/images/team/gabi.jpg",
            },
            {
              name: "Luisa Deragon",
              role: "English Language Teacher",
              credentials: "PhD, University of Cambridge | Cambridge-Educated Tutor",
              bio: "Fluent in English, Portuguese, and Spanish, Luisa specialises in 11+ preparation, ESL support, academic skills development, and general English. Her international experience supporting students across the UK, US, and Canada allows her to create highly personalised learning programmes.",
              photo: "/images/team/luisa.jpeg",
            },
            {
              name: "Anca Maria Gherghel",
              role: "Business, Finance & Mathematics Teacher",
              credentials: "Senior Research Manager | PhD Researcher",
              bio: "Anca specialises in Business, Finance, Mathematics, Analytical Thinking, and Financial Education. She combines academic research with practical expertise, helping students develop strong analytical skills, logical reasoning, and confidence in applying knowledge to real-world situations.",
              photo: "/images/team/anca.jpg",
            },
            {
              name: "Samuel Dicks",
              role: "Chemistry & STEM Teacher",
              credentials:
                "MChem (Hons) Chemistry with International Study, First-Class Honours, The University of Manchester | PhD Offer Holder in Atomic & Laser Physics, University of Oxford",
              bio: "Samuel specialises in 11+ Mathematics, GCSE and A-Level Chemistry, Physics and Mathematics, helping students develop strong subject knowledge, confidence and effective exam techniques. His structured, exam-focused lessons combine clear explanations with practical problem-solving strategies.",
              photo: "/images/team/sam.jpeg",
            },
            {
              name: "Saffron George",
              role: "Primary, 11+ & Spanish Teacher",
              credentials: "Qualified Teacher (QTS, PGCE)",
              bio: "Saffron is a qualified primary school teacher specialising in Primary English and Maths, 11+ preparation, and Spanish GCSE. As a fluent Spanish speaker, she combines strong subject knowledge with a supportive and engaging teaching style.",
              photo: "/images/team/saffron.jpeg",
            },
            {
              name: "Djennè Stephens",
              photo: "/images/team/djenne.jpg",
              role: "GCSE English & ESOL Teacher",
              credentials:
                "Qualified Further Education English Lecturer | CELTA Qualified | PGCE in Progress",
              bio: "Djennè specialises in GCSE English, Functional Skills English and ESOL, working with children, young people and adults. She holds a First Class BA (Hons) in Childhood and Youth Studies with Psychology and has experience supporting learners with SEND, GCSE resits and English as an additional language. Her teaching combines academic progress with confidence-building through engaging, personalised lessons.",
            },
          ],
        },
      ],
    },
    {
      id: "final-cta",
      blocks: [
        {
          type: "cta",
          title: "Ready to Take the Next Step?",
          body: "Every successful journey starts with understanding where you are today and where you want to go tomorrow. Book an assessment and receive personalised recommendations tailored to your goals. Whether you are preparing for exams, planning university applications, developing professional skills, or adapting to life in the UK, we are here to help.",
          note: "No obligation. Personalised guidance. Clear next steps.",
          cta: { label: "Get Expert Guidance", href: "/book-assessment" },
        },
      ],
    },
  ],
};
