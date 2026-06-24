export interface SkillData {
  name: string;
  category: string;
  description: string;
  relations: string[];
}

export const skillCategories = [
  {
    category: "Languages",
    skills: ["C#", "TypeScript"]
  },
  {
    category: "Frontend",
    skills: ["React", "Vite", "React Hooks", "Context API", "Tailwind CSS"]
  },
  {
    category: "Backend & Data",
    skills: ["ASP.NET Core Web API", "RESTful API", "Entity Framework Core", "SQL Server"]
  },
  {
    category: "Auth & Workflow",
    skills: ["JWT Authentication", "Role/Permission Access Control", "Git", "GitHub", "npm", "AI Workflow Design", "AI-Assisted Development"]
  }
];

export const enhancedSkills: Record<string, SkillData> = {
  "C#": { name: "C#", category: "Languages", description: "Primary backend language used with ASP.NET Core Web API.", relations: ["ASP.NET Core Web API", "Entity Framework Core"] },
  "TypeScript": { name: "TypeScript", category: "Languages", description: "Typed JavaScript used for React frontend development.", relations: ["React", "Vite", "React Hooks"] },
  "React": { name: "React", category: "Frontend", description: "Component-based UI library used to build AI Press frontend modules.", relations: ["TypeScript", "React Hooks", "Context API", "Tailwind CSS"] },
  "Vite": { name: "Vite", category: "Frontend", description: "Frontend tooling used for fast React development and production builds.", relations: ["React", "TypeScript", "npm"] },
  "React Hooks": { name: "React Hooks", category: "Frontend", description: "React state and lifecycle patterns for interactive UI modules.", relations: ["React", "Context API"] },
  "Context API": { name: "Context API", category: "Frontend", description: "React state-sharing mechanism for application-level data flow.", relations: ["React", "React Hooks"] },
  "Tailwind CSS": { name: "Tailwind CSS", category: "Frontend", description: "Utility-first CSS framework used for responsive frontend styling.", relations: ["React", "TypeScript"] },
  "ASP.NET Core Web API": { name: "ASP.NET Core Web API", category: "Backend & Data", description: "Backend framework used to build RESTful services for AI Press.", relations: ["C#", "RESTful API", "JWT Authentication", "Entity Framework Core"] },
  "RESTful API": { name: "RESTful API", category: "Backend & Data", description: "API design approach used for client-server communication.", relations: ["ASP.NET Core Web API", "JWT Authentication"] },
  "Entity Framework Core": { name: "Entity Framework Core", category: "Backend & Data", description: "ORM used with SQL Server for backend data access.", relations: ["C#", "SQL Server", "ASP.NET Core Web API"] },
  "SQL Server": { name: "SQL Server", category: "Backend & Data", description: "Relational database used for application data persistence.", relations: ["Entity Framework Core", "Role/Permission Access Control"] },
  "JWT Authentication": { name: "JWT Authentication", category: "Auth & Workflow", description: "Token-based authentication used for protected backend APIs.", relations: ["ASP.NET Core Web API", "Role/Permission Access Control"] },
  "Role/Permission Access Control": { name: "Role/Permission Access Control", category: "Auth & Workflow", description: "Authorization model for managing user roles and permissions.", relations: ["JWT Authentication", "SQL Server"] },
  "Git": { name: "Git", category: "Auth & Workflow", description: "Version control used in team development and code review workflows.", relations: ["GitHub"] },
  "GitHub": { name: "GitHub", category: "Auth & Workflow", description: "Repository hosting and collaboration platform used with Git.", relations: ["Git"] },
  "npm": { name: "npm", category: "Auth & Workflow", description: "JavaScript package manager used for frontend tooling and scripts.", relations: ["Vite", "React"] },
  "AI Workflow Design": { name: "AI Workflow Design", category: "Auth & Workflow", description: "Designing AI-assisted development workflows for practical software delivery.", relations: ["AI-Assisted Development"] },
  "AI-Assisted Development": { name: "AI-Assisted Development", category: "Auth & Workflow", description: "Using AI tools to support implementation, review, and iteration.", relations: ["AI Workflow Design", "GitHub"] }
};

