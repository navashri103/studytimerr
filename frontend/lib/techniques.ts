import { BarChart3, Hourglass, LayoutGrid, Timer } from "lucide-react";

export type Technique = {
  id: string;
  index: string;
  name: string;
  description: string;
  href: string;
  icon: typeof Timer;
  accent: string;
  border: string;
};

export const techniques: Technique[] = [
  {
    id: "pomodoro",
    index: "01",
    name: "Pomodoro Technique",
    description: "Focused 25-minute sprints separated by short breaks.",
    href: "/pomodoro",
    icon: Timer,
    accent: "text-orange-700",
    border: "hover:border-orange-700/70",
  },
  {
    id: "eisenhower",
    index: "02",
    name: "Eisenhower Matrix",
    description: "Sort tasks by urgency and importance to decide what matters.",
    href: "/eisenhower",
    icon: LayoutGrid,
    accent: "text-teal-700",
    border: "hover:border-teal-700/70",
  },
  {
    id: "pareto",
    index: "03",
    name: "Pareto Analysis",
    description: "Find the vital few tasks that drive most of your results.",
    href: "/pareto",
    icon: BarChart3,
    accent: "text-amber-700",
    border: "hover:border-amber-700/70",
  },
  {
    id: "parkinsons",
    index: "04",
    name: "Parkinson's Law",
    description: "Set a shorter deadline and watch your focus rise to meet it.",
    href: "/parkinsons",
    icon: Hourglass,
    accent: "text-violet-700",
    border: "hover:border-violet-700/70",
  },
];
