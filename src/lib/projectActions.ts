interface ProjectActionInput {
  github?: string;
  demo?: string;
}

export interface ProjectAction {
  label: "SOURCE CODE" | "NO SOURCE" | "VIEW PROJECT" | "LOCKED";
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

  return {
    label: "LOCKED",
    href: undefined,
    disabled: true,
  };
}
