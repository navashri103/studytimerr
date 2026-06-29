export const WORD_LIST = [
  "focus",
  "study",
  "timer",
  "method",
  "review",
  "practice",
  "memory",
  "habit",
  "schedule",
  "progress",
  "goal",
  "deadline",
  "exam",
  "notes",
  "revise",
];

export function scrambleWord(
  word: string,
  shuffle: <T>(items: T[]) => T[] = defaultShuffle,
): string {
  const letters = word.split("");
  if (letters.length <= 1) return word;

  let scrambled = shuffle(letters).join("");
  let attempts = 0;
  while (scrambled === word && attempts < 10) {
    scrambled = shuffle(letters).join("");
    attempts++;
  }
  return scrambled;
}

export function pickWord(
  words: string[] = WORD_LIST,
  random: () => number = Math.random,
): string {
  const index = Math.floor(random() * words.length);
  return words[index];
}

export function isCorrectGuess(word: string, guess: string): boolean {
  return word.trim().toLowerCase() === guess.trim().toLowerCase();
}

function defaultShuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
