export interface SkillData {
  name: string;
  category: string;
  description: string;
  relations: string[];
}

export const skillCategories = [
  {
    category: "Frontend Subsystems",
    skills: ["React", "TypeScript", "Tailwind CSS", "Zustand", "HTML/CSS"]
  },
  {
    category: "Backend Core",
    skills: ["Node.js", "Express", "Firebase", "PostgreSQL", "Cloud SQL"]
  },
  {
    category: "Architecture & Design",
    skills: ["RBAC Security", "CMS Architectures", "RESTful Interfaces", "System Modeling"]
  },
  {
    category: "Deployment & Operations",
    skills: ["Git Version Control", "Vite Toolchains", "Docker Basics", "GCP Fundamentals"]
  }
];

export const enhancedSkills: Record<string, SkillData> = {
  "React": { name: "React", category: "Frontend Subsystems", description: "Component-based UI library for dynamic client experiences.", relations: ["TypeScript", "Tailwind CSS", "Zustand"] },
  "TypeScript": { name: "TypeScript", category: "Frontend Subsystems", description: "Strict syntactical superset of JavaScript ensuring type safety.", relations: ["React", "Node.js"] },
  "Tailwind CSS": { name: "Tailwind CSS", category: "Frontend Subsystems", description: "Utility-first CSS framework for rapid UI styling.", relations: ["React", "HTML/CSS"] },
  "Zustand": { name: "Zustand", category: "Frontend Subsystems", description: "Small, fast, and scalable bearbones state-management.", relations: ["React"] },
  "HTML/CSS": { name: "HTML/CSS", category: "Frontend Subsystems", description: "Core web markup and stylesheet languages.", relations: ["Tailwind CSS"] },
  "Node.js": { name: "Node.js", category: "Backend Core", description: "Asynchronous event-driven JavaScript runtime.", relations: ["Express", "TypeScript"] },
  "Express": { name: "Express", category: "Backend Core", description: "Fast, unopinionated, minimalist web framework for Node.js.", relations: ["Node.js", "RESTful Interfaces"] },
  "Firebase": { name: "Firebase", category: "Backend Core", description: "Platform developed by Google for creating mobile and web applications.", relations: ["Node.js", "GCP Fundamentals"] },
  "PostgreSQL": { name: "PostgreSQL", category: "Backend Core", description: "Powerful, open source object-relational database system.", relations: ["Node.js", "Cloud SQL"] },
  "Cloud SQL": { name: "Cloud SQL", category: "Backend Core", description: "Fully managed relational database service for MySQL, PostgreSQL, and SQL Server.", relations: ["PostgreSQL", "GCP Fundamentals"] },
  "RBAC Security": { name: "RBAC Security", category: "Architecture & Design", description: "Role-based access control for managing system permissions.", relations: ["System Modeling", "CMS Architectures"] },
  "CMS Architectures": { name: "CMS Architectures", category: "Architecture & Design", description: "Design patterns for content management systems.", relations: ["RBAC Security", "PostgreSQL", "RESTful Interfaces"] },
  "RESTful Interfaces": { name: "RESTful Interfaces", category: "Architecture & Design", description: "Architectural style for application programming interfaces.", relations: ["Express", "System Modeling"] },
  "System Modeling": { name: "System Modeling", category: "Architecture & Design", description: "Process of developing abstract models of a system.", relations: ["RBAC Security", "RESTful Interfaces"] },
  "Git Version Control": { name: "Git Version Control", category: "Deployment & Operations", description: "Distributed version control system for tracking changes.", relations: ["Vite Toolchains"] },
  "Vite Toolchains": { name: "Vite Toolchains", category: "Deployment & Operations", description: "Next generation frontend tooling for fast build and dev server.", relations: ["React", "TypeScript"] },
  "Docker Basics": { name: "Docker Basics", category: "Deployment & Operations", description: "OS-level virtualization to deliver software in packages called containers.", relations: ["GCP Fundamentals"] },
  "GCP Fundamentals": { name: "GCP Fundamentals", category: "Deployment & Operations", description: "Suite of cloud computing services provided by Google.", relations: ["Cloud SQL", "Firebase", "Docker Basics"] }
};

