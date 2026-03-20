import { create } from 'zustand';

type GameState = "WAITING" | "PLAYING" | "CRASHED";

type CrashStore = {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  
  currentMultiplier: number;
  setCurrentMultiplier: (val: number) => void;
  
  crashPoint: number;
  setCrashPoint: (val: number) => void;
  
  betAmount: number | null;
  setBetAmount: (val: number | null) => void;
  
  isBetPlaced: boolean;
  setIsBetPlaced: (val: boolean) => void;
  
  hasCashedOut: boolean;
  setHasCashedOut: (val: boolean) => void;
  
  profit: number;
  setProfit: (val: number) => void;
  
  countdown: number;
  setCountdown: (val: number) => void;
};

export const useCrashStore = create<CrashStore>()((set) => ({
  gameState: "WAITING",
  setGameState: (gameState) => set({ gameState }),
  
  currentMultiplier: 1.0,
  setCurrentMultiplier: (currentMultiplier) => set({ currentMultiplier }),
  
  crashPoint: 0,
  setCrashPoint: (crashPoint) => set({ crashPoint }),
  
  betAmount: null,
  setBetAmount: (betAmount) => set({ betAmount }),
  
  isBetPlaced: false,
  setIsBetPlaced: (isBetPlaced) => set({ isBetPlaced }),
  
  hasCashedOut: false,
  setHasCashedOut: (hasCashedOut) => set({ hasCashedOut }),
  
  profit: 0,
  setProfit: (profit) => set({ profit }),
  
  countdown: 5,
  setCountdown: (countdown) => set({ countdown }),
}));
