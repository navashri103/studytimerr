export type ParkinsonsState = {
  taskName: string;
  totalSeconds: number;
  secondsLeft: number;
  isRunning: boolean;
  isSetup: boolean;
};

export function createInitialParkinsonsState(): ParkinsonsState {
  return {
    taskName: "",
    totalSeconds: 0,
    secondsLeft: 0,
    isRunning: false,
    isSetup: false,
  };
}

export type ParkinsonsAction =
  | { type: "SETUP"; taskName: string; totalSeconds: number }
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "NEW_TASK" }
  | { type: "TICK" };

export function parkinsonsReducer(
  state: ParkinsonsState,
  action: ParkinsonsAction,
): ParkinsonsState {
  switch (action.type) {
    case "SETUP":
      if (!action.taskName.trim() || action.totalSeconds <= 0) return state;
      return {
        taskName: action.taskName.trim(),
        totalSeconds: action.totalSeconds,
        secondsLeft: action.totalSeconds,
        isRunning: false,
        isSetup: true,
      };
    case "START":
      if (!state.isSetup || state.secondsLeft <= 0) return state;
      return { ...state, isRunning: true };
    case "PAUSE":
      return { ...state, isRunning: false };
    case "RESET":
      return { ...state, secondsLeft: state.totalSeconds, isRunning: false };
    case "NEW_TASK":
      return createInitialParkinsonsState();
    case "TICK": {
      if (!state.isRunning) return state;
      if (state.secondsLeft <= 1) {
        return { ...state, secondsLeft: 0, isRunning: false };
      }
      return { ...state, secondsLeft: state.secondsLeft - 1 };
    }
    default:
      return state;
  }
}
