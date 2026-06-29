import { BarChart3, Hourglass, LayoutGrid, Timer } from "lucide-react";

export type Technique = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: typeof Timer;
  chipBg: string;
  accent: string;
};

export const techniques: Technique[] = [
  {
    id: "pomodoro",
    name: "Pomodoro Technique",
    description: "Focused 25-minute sprints separated by short breaks.",
    href: "/pomodoro",
    icon: Timer,
    chipBg: "bg-orange-100",
    accent: "text-orange-700",
  },
  {
    id: "eisenhower",
    name: "Eisenhower Matrix",
    description: "Sort tasks by urgency and importance to decide what matters.",
    href: "/eisenhower",
    icon: LayoutGrid,
    chipBg: "bg-sky-100",
    accent: "text-sky-700",
  },
  {
    id: "pareto",
    name: "Pareto Analysis",
    description: "Find the vital few tasks that drive most of your results.",
    href: "/pareto",
    icon: BarChart3,
    chipBg: "bg-amber-100",
    accent: "text-amber-700",
  },
  {
    id: "parkinsons",
    name: "Parkinson's Law",
    description: "Set a shorter deadline and watch your focus rise to meet it.",
    href: "/parkinsons",
    icon: Hourglass,
    chipBg: "bg-violet-100",
    accent: "text-violet-700",
  },
];
