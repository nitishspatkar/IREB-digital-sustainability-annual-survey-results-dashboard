import Demographic from "../pages/demographic/DemographicPage";
import DigitalSustainabilityRole from "../pages/role-of-digital-sustainability/DigitalSustainabilityRolePage";
import GeneralAwareness from "../pages/general-awareness/GeneralAwarenessPage";
import SustainabilityTasks from "../pages/sustainability-in-job-and-tasks/SustainabilityTasksPage";

export const navigationSections = [
  { id: "demographic", label: "Demographic", component: Demographic },
  {
    id: "general-awareness",
    label: "General Awareness of Sustainability",
    component: GeneralAwareness,
  },
  {
    id: "digital-sustainability-role",
    label: "The Role of Digital Sustainability in Your Organization",
    component: DigitalSustainabilityRole,
  },
  {
    id: "sustainability-tasks",
    label: "Sustainability in Your Job and Tasks",
    component: SustainabilityTasks,
  },
] as const;

export type SectionId = (typeof navigationSections)[number]["id"];
