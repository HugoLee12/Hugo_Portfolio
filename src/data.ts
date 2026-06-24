export interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  role: string;
  duration: string;
  stardate: string;
  status: "ACTIVE" | "ARCHIVED" | "IN PROGRESS";
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
      "AI Press is a faculty-led CMS and digital publishing project for managing articles, editorial workflows, and e-kiosk content. I contributed as a full-stack developer, building React/TypeScript interfaces and supporting ASP.NET Core API features backed by SQL Server.",
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
    image: "/project_pic/AIPress/Screenshot%202026-06-24%20213353.png",
    images: ["/project_pic/AIPress/Screenshot%202026-06-24%20213353.png"],
  },
  {
    id: "hugo-portfolio",
    name: "Hugo Portfolio",
    category: "CINEMATIC PORTFOLIO SYSTEM",
    description:
      "Hugo Portfolio is this cinematic personal portfolio experience: a dark recruiter-friendly interface with a Black Hole Project Universe, orbiting project nodes, dossier overlays, shader-driven visuals, and responsive portfolio sections. The project focuses on presenting real developer identity and project work through a polished interactive system.",
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
      "/project_pic/Hugo_Portfolio/Screenshot%202026-06-24%20212345.png",
    images: [
      "/project_pic/Hugo_Portfolio/Screenshot%202026-06-24%20212345.png",
      "/project_pic/Hugo_Portfolio/Screenshot%202026-06-24%20212620.png",
    ],
  },
  {
    id: "reserved-dossier-01",
    name: "Signal Reserved I",
    category: "NO DATA // RESERVED NODE",
    description:
      "This orbital slot is intentionally reserved for a future project dossier. It keeps the Project Universe visually populated without presenting unfinished or unverified portfolio claims.",
    role: "Pending Dossier",
    duration: "Unassigned",
    stardate: "NO.DATA.01",
    status: "ARCHIVED",
    techStack: ["No Data", "Reserved Orbit", "Future Project"],
    orbitRadius: 7.1,
    orbitSpeed: 0.065,
    startAngle: Math.PI * 1.55,
    color: "#f59e0b",
    size: 0.27,
  },
  {
    id: "reserved-dossier-02",
    name: "Signal Reserved II",
    category: "NO DATA // LOCKED DOSSIER",
    description:
      "A locked project signal with no public data assigned yet. The node exists as part of the universe composition and will be replaced when another real project is ready.",
    role: "Locked Record",
    duration: "Unassigned",
    stardate: "NO.DATA.02",
    status: "ARCHIVED",
    techStack: ["No Data", "Locked Signal", "Awaiting Evidence"],
    orbitRadius: 8.4,
    orbitSpeed: 0.05,
    startAngle: Math.PI * 0.05,
    color: "#a78bfa",
    size: 0.29,
  },
  {
    id: "reserved-dossier-03",
    name: "Signal Reserved III",
    category: "NO DATA // DEEP ARCHIVE",
    description:
      "A deep-archive placeholder for future verified work. It is deliberately marked as no data so the visual density improves without implying a completed project.",
    role: "Deep Archive",
    duration: "Unassigned",
    stardate: "NO.DATA.03",
    status: "ARCHIVED",
    techStack: ["No Data", "Deep Archive", "Verification Pending"],
    orbitRadius: 9.6,
    orbitSpeed: 0.038,
    startAngle: Math.PI * 1.18,
    color: "#f472b6",
    size: 0.31,
  },
];
