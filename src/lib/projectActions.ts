interface ProjectActionInput {
  github?: string;
  demo?: string;
  status?: string;
}

export interface ProjectAction {
  label: "SOURCE CODE" | "NO SOURCE" | "VIEW PROJECT" | "NO PUBLIC DEMO" | "LOCKED";
  href?: string;
  disabled: boolean;
}

export function getSourceProjectAction(project: ProjectActionInput): ProjectAction {
  if (project.github) {
    return {
      label: "SOURCE CODE",
      href: project.github,
      disabled: false,
    };
  }

  return {
    label: "NO SOURCE",
    href: undefined,
    disabled: true,
  };
}

export function getPrimaryProjectAction(project: ProjectActionInput): ProjectAction {
  if (project.demo) {
    return {
      label: "VIEW PROJECT",
      href: project.demo,
      disabled: false,
    };
  }

  // LOCKED is reserved-node vocabulary; a real project without a public
  // demo must not read like a placeholder.
  return {
    label: project.status === "RESERVED" ? "LOCKED" : "NO PUBLIC DEMO",
    href: undefined,
    disabled: true,
  };
}
