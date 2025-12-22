export const navigationSections = [
  { id: "demographic", label: "Demographics", path: "/demographics" },
  {
    id: "general-awareness",
    label: "General Awareness of Sustainability",
    path: "/general-awareness",
  },
  {
    id: "digital-sustainability-role",
    label: "The Role of Digital Sustainability in Organizations",
    path: "/digital-sustainability-role",
  },
  {
    id: "sustainability-tasks",
    label: "Sustainability in Role-specific Tasks",
    path: "/sustainability-tasks",
  },
] as const;

export type SectionId = (typeof navigationSections)[number]["id"];
