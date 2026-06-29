export type TechniqueId = "pomodoro" | "eisenhower" | "pareto" | "parkinsons";

export type QuizOption = {
  label: string;
  scores: Partial<Record<TechniqueId, number>>;
};

export type QuizQuestion = {
  question: string;
  options: QuizOption[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "What's overwhelming you right now?",
    options: [
      {
        label: "Too many tasks, hard to know what matters",
        scores: { pareto: 2, eisenhower: 1 },
      },
      {
        label: "One big task, no real deadline",
        scores: { parkinsons: 2 },
      },
      {
        label: "I keep getting distracted",
        scores: { pomodoro: 2 },
      },
      {
        label: "Urgent stuff crowding out important stuff",
        scores: { eisenhower: 2, pareto: 1 },
      },
    ],
  },
  {
    question: "How much time do you actually have right now?",
    options: [
      {
        label: "One short focused block",
        scores: { pomodoro: 2 },
      },
      {
        label: "Most of the day — I need to plan it out",
        scores: { eisenhower: 1, pareto: 1 },
      },
      {
        label: "Open-ended, no fixed deadline",
        scores: { parkinsons: 2 },
      },
      {
        label: "Not sure, I just want to start",
        scores: { pomodoro: 1 },
      },
    ],
  },
  {
    question: "What would help most?",
    options: [
      {
        label: "A timer that forces real breaks",
        scores: { pomodoro: 2 },
      },
      {
        label: "Deciding what to do, delegate, or drop",
        scores: { eisenhower: 2 },
      },
      {
        label: "Finding the 20% that matters most",
        scores: { pareto: 2 },
      },
      {
        label: "A tighter deadline to create urgency",
        scores: { parkinsons: 2 },
      },
    ],
  },
];

const TIE_BREAK_ORDER: TechniqueId[] = [
  "pomodoro",
  "eisenhower",
  "pareto",
  "parkinsons",
];

export function scoreAnswers(
  answers: QuizOption[],
): Record<TechniqueId, number> {
  const totals: Record<TechniqueId, number> = {
    pomodoro: 0,
    eisenhower: 0,
    pareto: 0,
    parkinsons: 0,
  };
  for (const answer of answers) {
    for (const id of TIE_BREAK_ORDER) {
      totals[id] += answer.scores[id] ?? 0;
    }
  }
  return totals;
}

export function pickTechnique(answers: QuizOption[]): TechniqueId {
  const totals = scoreAnswers(answers);
  let best = TIE_BREAK_ORDER[0];
  for (const id of TIE_BREAK_ORDER) {
    if (totals[id] > totals[best]) best = id;
  }
  return best;
}
