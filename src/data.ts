export interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  role: string;
  duration: string;
  stardate: string;
  status: "ACTIVE" | "ARCHIVED" | "IN PROGRESS" | "RESERVED";
  techStack: string[];
  image?: string;
  images?: string[];
  orbitRadius: number;
  orbitSpeed: number;
  startAngle: number;
  color: string;
  size: number;
  github?: string;
  demo?: string;
}

export const projects: Project[] = [
  {
    id: "ai-press",
    name: "AI Press",
    category: "CMS & DIGITAL PUBLISHING",
    description:
      "A faculty-led CMS and digital publishing platform developed with a student team to manage articles, editorial workflows, and e-kiosk content. I contributed React and TypeScript interfaces plus ASP.NET Core API features backed by SQL Server.",
    role: "Full-stack Developer",
    duration: "03/2026 - Present",
    stardate: "2026.03",
    status: "ACTIVE",
    techStack: ["React", "TypeScript", "Vite", "Tailwind CSS", "ASP.NET Core Web API", "Entity Framework Core", "SQL Server"],
    orbitRadius: 4.2,
    orbitSpeed: 0.14,
    startAngle: Math.PI / 4,
    color: "#34d399",
    size: 0.3,
    image: "/project_pic/AIPress/Screenshot%202026-06-24%20213353.webp",
    images: ["/project_pic/AIPress/Screenshot%202026-06-24%20213353.webp"],
  },
  {
    id: "hugo-portfolio",
    name: "Hugo Portfolio",
    category: "CINEMATIC PORTFOLIO SYSTEM",
    description:
      "A cinematic, recruiter-facing portfolio built around the Black Hole Project Universe. Orbiting Project Nodes, attached Dossiers, shader-driven visuals, and a responsive Portfolio Shell present real project work through one polished interactive system.",
    role: "Frontend Developer",
    duration: "06/2026 - Present",
    stardate: "2026.06",
    status: "ACTIVE",
    techStack: ["React", "TypeScript", "Vite", "Tailwind CSS", "React Three Fiber", "Three.js", "Motion", "Zustand"],
    orbitRadius: 5.8,
    orbitSpeed: 0.09,
    startAngle: Math.PI * 0.9,
    color: "#60a5fa",
    size: 0.34,
    github: "https://github.com/HugoLee12/Hugo_Portfolio",
    image:
      "/project_pic/Hugo_Portfolio/Screenshot%202026-06-24%20212345.webp",
    images: [
      "/project_pic/Hugo_Portfolio/Screenshot%202026-06-24%20212345.webp",
      "/project_pic/Hugo_Portfolio/Screenshot%202026-06-24%20212620.webp",
    ],
  },
  {
    id: "reserved-dossier-01",
    name: "Signal Reserved I",
    category: "RESERVED // FUTURE ENTRY",
    description:
      "This Reserved Node holds an orbital slot for future verified work while preserving the Project Universe composition. It makes no claim about unfinished work.",
    role: "Reserved Slot",
    duration: "Awaiting Assignment",
    stardate: "RESERVED.01",
    status: "RESERVED",
    techStack: ["Reserved Node", "Future Entry", "Orbit Slot"],
    orbitRadius: 7.1,
    orbitSpeed: 0.065,
    startAngle: Math.PI * 1.55,
    color: "#f59e0b",
    size: 0.27,
  },
  {
    id: "reserved-dossier-02",
    name: "Signal Reserved II",
    category: "RESERVED // PENDING ASSIGNMENT",
    description:
      "This Reserved Node is an intentional orbit allocation. It remains reserved until a verified project is ready to occupy the slot.",
    role: "Reserved Slot",
    duration: "Awaiting Assignment",
    stardate: "RESERVED.02",
    status: "RESERVED",
    techStack: ["Reserved Node", "System Slot", "Pending Assignment"],
    orbitRadius: 8.4,
    orbitSpeed: 0.05,
    startAngle: Math.PI * 0.05,
    color: "#a78bfa",
    size: 0.29,
  },
  {
    id: "reserved-dossier-03",
    name: "Signal Reserved III",
    category: "RESERVED // ORBIT CAPACITY",
    description:
      "This Reserved Node maintains system density for a future Project Entry without implying completed work.",
    role: "Reserved Slot",
    duration: "Awaiting Assignment",
    stardate: "RESERVED.03",
    status: "RESERVED",
    techStack: ["Reserved Node", "Orbit Capacity", "Future Signal"],
    orbitRadius: 9.6,
    orbitSpeed: 0.038,
    startAngle: Math.PI * 1.18,
    color: "#f472b6",
    size: 0.31,
  },
];
