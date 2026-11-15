// All site content lives here. Edit text, links and lists without touching the components.

export const site = {
  name: "Aareen Mhatre",
  heroWord: "PORTFOLIO",
  role: { plain: "Backend & Data", italic: "developer" },
  location: "Mumbai, India",  email: "aareenmhatre2005@gmail.com",
  // Put the file at public/resume.pdf so it is served at this path.
  resume: "/resume.pdf",
  links: {
    github: "https://github.com/AareenMhatre05",
    linkedin: "https://www.linkedin.com/in/aareen-mhatre",
  },
};

// Hero particle portrait. Particles are placed only inside `outline` (photo pixel
// coordinates, traced around the person) so the photo's background is ignored.
// If you change the photo, update width/height and redraw the outline.
export const portrait = {
  src: "/me.jpeg",
  width: 960,
  height: 1280,
  outline: [
    [390, 385], [440, 340], [500, 330], [550, 345], [580, 385], [585, 430], [560, 455], [555, 490],
    [535, 515], [545, 548], [600, 575], [650, 605], [700, 650], [725, 720], [742, 820], [742, 900],
    [735, 945], [700, 955], [672, 1000], [675, 1150], [668, 1230], [650, 1280], [300, 1280], [300, 1240],
    [298, 1200], [295, 1100], [300, 960], [250, 910], [240, 860], [245, 780], [260, 700], [290, 640],
    [340, 600], [390, 575], [430, 565], [440, 548], [425, 525], [408, 505], [405, 480], [380, 440], [385, 415],
  ] as [number, number][],
};

export const nav = [
  { label: "About", href: "#about" },
  { label: "What I do", href: "#what-i-do" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export const about = {
  heading: "About",
  body: [
    "I'm Aareen, a Computer Engineering student at St. Francis Institute of Technology in Mumbai.",
    "I like the parts of software that sit under the screen: databases, backends and the cloud. Recently that has meant putting every access rule for a shop's apps inside Postgres and running Spark over 229 million messages on one laptop.",
    "I work mostly in Python, SQL and JavaScript, pick up new tools quickly, and want to learn from real production work.",
  ],
};

export const skillGroups = [
  { label: "Languages", items: ["Python", "SQL", "PL/pgSQL", "JavaScript", "Dart", "HTML", "CSS"] },
  { label: "Cloud & backend", items: ["AWS", "Microsoft Azure", "PostgreSQL", "Supabase", "PostGIS", "Firebase"] },
  { label: "Frameworks", items: ["Flutter", "React", "Tailwind CSS", "Flask", "Apache Spark", "Apache Hive"] },
  { label: "Data & BI", items: ["Power BI", "Tableau", "Excel", "scikit-learn", "pandas"] },
  { label: "Tools", items: ["Git", "GitHub", "JIRA"] },
];

export const services = [
  {
    title: "Backend, databases & cloud",
    points: [
      "Postgres schemas with row-level security",
      "PL/pgSQL functions and triggers",
      "Supabase auth, storage and Deno edge functions",
      "PostGIS for location data",
      "Typo-tolerant search with trigram similarity",
      "AWS and Microsoft Azure fundamentals (coursework)",
    ],
    description:
      "I put the rules where the data lives. In my General Store app, 64 row-level security policies decide who can read or change what, so a bug in the app can't show one customer another customer's order.",
  },
  {
    title: "Mobile & web apps",
    points: [
      "Android apps in Flutter and Dart",
      "React front ends",
      "Firebase Authentication and Firestore rules",
      "Live delivery maps on OpenStreetMap",
      "Responsive layouts with Tailwind CSS",
    ],
    description:
      "Two Android apps sharing one backend, and a React meal planner that is live on Firebase Hosting with email-verified sign-in.",
  },
  {
    title: "Data & machine learning",
    points: [
      "Spark and Hive pipelines over Parquet",
      "Text classification with TF-IDF and Logistic Regression",
      "Search and ranking written from scratch",
      "Dashboards in Power BI, Tableau and Flask",
    ],
    description:
      "From 229 million Discord messages processed in 41 minutes to a Marathi healthcare chatbot my NLP team trained on 2,843 sentences we built ourselves.",
  },
];

export type Project = {
  title: string;
  summary: string;
  stack: string[];
  github?: string;
  live?: string;
  image: { src: string; alt: string; width: number; height: number; kind: "phone" | "wide" };
};

export const projectsIntro =
  "Things I've built at college and on my own, from database-first apps to data pipelines. Descriptions come from each project's README.";

export const projects: Project[] = [
  {
    title: "General Store App",
    summary:
      "A grocery delivery platform for one real neighbourhood shop: a customer app and a staff app over one Supabase backend. Every authorization rule lives in Postgres as 64 row-level security policies, and search finds the right product even when you type \"mlik\" or \"bttr\".",
    stack: ["Flutter", "Dart", "Supabase", "PostgreSQL", "PL/pgSQL", "PostGIS", "Deno", "OpenStreetMap"],
    github: "https://github.com/AareenMhatre05/General-Store-App",
    image: {
      src: "/projects/general-store.jpg",
      alt: "General Store customer app home screen with product categories and offers",
      width: 720,
      height: 1600,
      kind: "phone",
    },
  },
  {
    title: "Grocery List & Meal Planner",
    summary:
      "A pantry-first planner for Indian home cooks. Plan a week from 60 Indian recipes, then build a grocery list that leaves out what's already in your pantry, with the day's mandi prices from data.gov.in and packaged products from Open Food Facts.",
    stack: ["React", "Tailwind CSS", "Firebase Authentication", "Cloud Firestore"],
    github: "https://github.com/AareenMhatre05/Grocery-List-Meal-Planner",
    live: "https://grocery-meal-planner-74345.web.app",
    image: {
      src: "/projects/grocery-planner.jpg",
      alt: "Meal planner dashboard showing today's meals, the week's progress and the grocery list",
      width: 1440,
      height: 900,
      kind: "wide",
    },
  },
  {
    title: "Discord Sentiment & Toxicity",
    summary:
      "A big data pipeline that scores sentiment and toxicity across 229 million Discord messages with Apache Hive, Spark and VADER. All three dataset releases ran in 41 minutes on one 16-thread laptop, and a Flask dashboard lets you explore the results by channel and conversation.",
    stack: ["Python", "Apache Spark", "Apache Hive", "VADER", "Parquet", "Flask"],
    github: "https://github.com/AareenMhatre05/Discord-Sentiment-Toxicity-BigData",
    image: {
      src: "/projects/discord-toxicity.png",
      alt: "Dashboard overview: 228,914,543 turns analysed, 6.92% toxic, processed in 41 minutes",
      width: 2560,
      height: 1620,
      kind: "wide",
    },
  },
  {
    title: "Marathi Healthcare Chatbot",
    summary:
      "Describe your symptoms in Marathi and it replies in Marathi with the three most likely of 41 diseases. Our NLP team translated English datasets into 2,843 Marathi sentences, handled Marathi negation and word endings, and reached 90.6% cross-validated accuracy.",
    stack: ["Python", "scikit-learn", "TF-IDF", "Logistic Regression", "IndicTrans2"],
    github: "https://github.com/AareenMhatre05/Marathi-Healthcare-Chatbot",
    image: {
      src: "/projects/marathi-chatbot.png",
      alt: "Chatbot answering a Marathi symptom description with tuberculosis at 88%, with preprocessing steps shown",
      width: 1800,
      height: 1924,
      kind: "wide",
    },
  },
  {
    title: "Symptom Retrieval System",
    summary:
      "Ranks medical conditions from plain-language symptom descriptions. Every technique is written from scratch in Python: a Porter stemmer, Boolean and TF-IDF ranked search, spelling correction by edit distance, and Rocchio relevance feedback, all in a local web app.",
    stack: ["Python", "TF-IDF", "Boolean retrieval", "Levenshtein distance", "Rocchio feedback"],
    github: "https://github.com/AareenMhatre05/medical-symptom-retrieval-system",
    image: {
      src: "/projects/symptom-retrieval.png",
      alt: "Ranked search results for a symptom query, with matched symptoms and term scores",
      width: 1100,
      height: 900,
      kind: "wide",
    },
  },
];

export const education = [
  {
    school: "St. Francis Institute of Technology",
    degree: "B.E. Computer Engineering",
    place: "Mumbai, India",
    when: "Expected 2027",
  },
];

export const experience = [
  { role: "Marketing Executive", org: "CSI, St. Francis Institute of Technology", when: "2024 – 25" },
  { role: "Volunteer", org: "Prakalp Project Competition, St. Francis Institute of Technology", when: "2024" },
];

export const certifications = [
  {
    name: "AI Automation & Intelligent Solutions training program",
    issuer: "BharatCares, with AICTE & IBM SkillsBuild, Jun – Jul 2026",
  },
  { name: "AWS Cloud Technical Essentials", issuer: "Amazon Web Services, Coursera" },
  { name: "Introduction to Microsoft Azure Cloud Services", issuer: "Microsoft, Coursera" },
  { name: "Generative AI: Prompt Engineering Basics", issuer: "IBM, Coursera" },
  { name: "Programming for Everybody (Getting Started with Python)", issuer: "University of Michigan, Coursera" },
  { name: "Python Data Structures", issuer: "University of Michigan, Coursera" },
];

export const contact = {
  status: "Open to opportunities",
  heading: "Get in touch",
  body: "I'm looking for internships and junior roles in software, databases and cloud. Email is the quickest way to reach me.",
};
