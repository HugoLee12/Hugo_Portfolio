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
  orbitRadius: number;
  orbitSpeed: number;
  startAngle: number;
  color: string;
  size: number;
  github?: string;
}

export const projects: Project[] = [
  {
    id: "quantum-drift",
    name: "Quantum Drift",
    category: "SECTOR-7 EXPLORATION",
    description:
      "A deep space telemetry and mapping initiative designed to outer rim. The primary objective involved navigating zones of high radiation while maintaining quantum communication links. Key technical challenges included real-time rendering of spatial distortion anomalies and zero-latency data packet transmission across vast parsecs.",
    role: "Lead Pilot",
    duration: "28 Months",
    stardate: "1648.2142",
    status: "ACTIVE",
    techStack: ["React", "Tailwind", "Three.js", "WebGL"],
    image:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000&auto=format&fit=crop",
    orbitRadius: 4,
    orbitSpeed: 0.15,
    startAngle: Math.PI / 4,
    color: "#34d399",
    size: 0.3,
    github: "https://github.com/lenhatanhhao14/quantum-drift",
  },
  {
    id: "lunar-watch",
    name: "Lunar Watch",
    category: "TRACKING & ANALYTICS",
    description:
      "A comprehensive dashboard for monitoring lunar mining outposts. Integrates real-time sensor data to optimize extraction routes and predict equipment wear-and-tear using machine learning models.",
    role: "Systems Engineer",
    duration: "14 Months",
    stardate: "1592.8801",
    status: "ARCHIVED",
    techStack: ["Vue", "D3.js", "Python", "PostgreSQL"],
    image:
      "https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=1000&auto=format&fit=crop",
    orbitRadius: 6,
    orbitSpeed: 0.08,
    startAngle: Math.PI,
    color: "#94a3b8",
    size: 0.25,
    github: "https://github.com/lenhatanhhao14/lunar-watch",
  },
  {
    id: "helios-mining",
    name: "Helios Mining",
    category: "VISUAL IDENTITY",
    description:
      "Brand identity and corporate website for Helios Mining Corp, the premier solar harvesting conglomerate. Involved full 3D rendering of their dyson-swarm concepts.",
    role: "Visual Designer",
    duration: "8 Months",
    stardate: "1610.0450",
    status: "ARCHIVED",
    techStack: ["Figma", "Cinema4D", "Next.js", "GSAP"],
    image:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1000&auto=format&fit=crop",
    orbitRadius: 8,
    orbitSpeed: 0.05,
    startAngle: Math.PI * 1.5,
    color: "#fb923c",
    size: 0.35,
    github: "https://github.com/lenhatanhhao14/helios-mining",
  },
  {
    id: "echoes-of-terra",
    name: "Echoes of Terra",
    category: "MEDIA & MOTION",
    description:
      "An interactive historical archive detailing the early days of human spaceflight. Features a rich, motion-heavy interface that guides users through historical milestones.",
    role: "Creative Tech",
    duration: "12 Months",
    stardate: "1660.1000",
    status: "IN PROGRESS",
    techStack: ["Svelte", "Framer Motion", "Three.js"],
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
    orbitRadius: 10,
    orbitSpeed: 0.03,
    startAngle: Math.PI * 0.8,
    color: "#60a5fa",
    size: 0.4,
    github: "https://github.com/lenhatanhhao14/echoes-of-terra",
  },
  {
    id: "nebula-os",
    name: "Nebula OS",
    category: "PRODUCT DESIGN",
    description:
      "Core interface design for the upcoming Nebula Operating System used in long-haul starliners. Focus on minimal cognitive load and high-contrast visibility in dark cabin environments.",
    role: "Lead Designer",
    duration: "36 Months",
    stardate: "1680.5000",
    status: "ACTIVE",
    techStack: ["Swift", "Metal", "Figma"],
    image:
      "https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=1000&auto=format&fit=crop",
    orbitRadius: 5.5,
    orbitSpeed: 0.1,
    startAngle: Math.PI * 1.8,
    color: "#818cf8",
    size: 0.28,
    github: "https://github.com/lenhatanhhao14/nebula-os",
  },
  {
    id: "beyond-orbit",
    name: "Beyond Orbit",
    category: "EXPERIENCES",
    description:
      "A VR experience allowing users to walk on the designated exoplanets in the Trappist-1 system. Built for educational institutions.",
    role: "VR Developer",
    duration: "18 Months",
    stardate: "1633.3333",
    status: "ACTIVE",
    techStack: ["Unity", "C#", "OpenXR"],
    image:
      "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1000&auto=format&fit=crop",
    orbitRadius: 7.5,
    orbitSpeed: 0.06,
    startAngle: 0,
    color: "#c084fc",
    size: 0.32,
    github: "https://github.com/lenhatanhhao14/beyond-orbit",
  },
];
