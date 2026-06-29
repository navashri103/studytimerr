import { BarChart3, Hourglass, LayoutGrid, Timer } from "lucide-react";

export type Technique = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: typeof Timer;
  accent: string;
  glow: string;
};

export const techniques: Technique[] = [
  {
    id: "pomodoro",
    name: "Pomodoro Technique",
    description: "Focused 25-minute sprints separated by short breaks.",
    href: "/pomodoro",
    icon: Timer,
    accent: "text-orange-400",
    glow: "shadow-orange-500/20 hover:border-orange-400/60",
  },
  {
    id: "eisenhower",
    name: "Eisenhower Matrix",
    description: "Sort tasks by urgency and importance to decide what matters.",
    href: "/eisenhower",
    icon: LayoutGrid,
    accent: "text-cyan-400",
    glow: "shadow-cyan-500/20 hover:border-cyan-400/60",
  },
  {
    id: "pareto",
    name: "Pareto Analysis",
    description: "Find the vital few tasks that drive most of your results.",
    href: "/pareto",
    icon: BarChart3,
    accent: "text-amber-400",
    glow: "shadow-amber-500/20 hover:border-amber-400/60",
  },
  {
    id: "parkinsons",
    name: "Parkinson's Law",
    description: "Set a shorter deadline and watch your focus rise to meet it.",
    href: "/parkinsons",
    icon: Hourglass,
    accent: "text-violet-400",
    glow: "shadow-violet-500/20 hover:border-violet-400/60",
  },
];
