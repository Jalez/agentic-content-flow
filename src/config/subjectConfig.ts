/** @format */

import { courseLevel } from "../store/useCourseStore";

export const subjectConfig: {
  [key: string]: {
    icon: string;
    baseColor: string;
    levelShades: { [K in courseLevel]: string };
  };
} = {
  "COMP.CS": {
    icon: "/static/images/icons/code.svg",
    baseColor: "#2196f3", // Blue
    levelShades: {
      basic: "#90caf9", // Light blue
      intermediate: "#2196f3", // Medium blue
      advanced: "#1565c0", // Dark blue
    },
  },
  MATH: {
    icon: "/static/images/icons/line.svg",
    baseColor: "#4caf50", // Green
    levelShades: {
      basic: "#a5d6a7",
      intermediate: "#4caf50",
      advanced: "#2e7d32",
    },
  },
  PHYS: {
    icon: "/static/images/icons/weight.svg",
    baseColor: "#f44336", // Red
    levelShades: {
      basic: "#ef9a9a",
      intermediate: "#f44336",
      advanced: "#c62828",
    },
  },
  BIO: {
    icon: "/static/images/icons/dna.svg",
    baseColor: "#9c27b0", // Purple
    levelShades: {
      basic: "#ce93d8",
      intermediate: "#9c27b0",
      advanced: "#6a1b9a",
    },
  },
  CHEM: {
    icon: "/static/images/icons/atom.svg",
    baseColor: "#ff9800", // Orange
    levelShades: {
      basic: "#ffb74d",
      intermediate: "#ff9800",
      advanced: "#ef6c00",
    },
  },
  LANG: {
    icon: "/static/images/icons/lang.svg",
    baseColor: "#795548", // Brown
    levelShades: {
      basic: "#a1887f",
      intermediate: "#795548",
      advanced: "#4e342e",
    },
  },
};
