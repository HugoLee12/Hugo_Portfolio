import assert from "node:assert/strict";
import {
  getPrimaryProjectAction,
  getSourceProjectAction,
} from "../src/lib/projectActions.ts";

const projectWithDemo = {
  name: "Live Project",
  github: "https://github.com/HugoLee12/live-project",
  demo: "https://example.com/live-project",
  status: "ACTIVE",
};

const projectWithSourceOnly = {
  name: "Source Only",
  github: "https://github.com/HugoLee12/source-only",
  status: "ACTIVE",
};

const reservedProject = {
  name: "Reserved",
  status: "ARCHIVED",
};

assert.deepEqual(getSourceProjectAction(projectWithDemo), {
  label: "SOURCE CODE",
  href: "https://github.com/HugoLee12/live-project",
  disabled: false,
});

assert.deepEqual(getSourceProjectAction(reservedProject), {
  label: "NO SOURCE",
  href: undefined,
  disabled: true,
});

assert.deepEqual(getPrimaryProjectAction(projectWithDemo), {
  label: "VIEW PROJECT",
  href: "https://example.com/live-project",
  disabled: false,
});

assert.deepEqual(getPrimaryProjectAction(projectWithSourceOnly), {
  label: "LOCKED",
  href: undefined,
  disabled: true,
});

assert.deepEqual(getPrimaryProjectAction(reservedProject), {
  label: "LOCKED",
  href: undefined,
  disabled: true,
});
