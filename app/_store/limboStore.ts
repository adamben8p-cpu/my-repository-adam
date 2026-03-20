import { create } from 'zustand';

type GameState = "IDLE" | "ROLLING" | "REVEALED";

type LimboStore = {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  
  targetMultiplier: number;
  setTargetMultiplier: (val: number) => void;
  
  betAmount: number | null;
  setBetAmount: (val: number | null) => void;
  
  resultMultiplier: number;
  setResultMultiplier: (val: number) => void;
  
  profit: number;
  setProfit: (val: number) => void;
  
  isWin: boolean;
  setIsWin: (val: boolean) => void;
  
  triggerRoll: (result: number, win: boolean, profit: number) => void;
};

export const useLimboStore = create<LimboStore>()((set) => ({
  gameState: "IDLE",
  setGameState: (gameState) => set({ gameState }),
  
  targetMultiplier: 2.00,
  setTargetMultiplier: (targetMultiplier) => set({ targetMultiplier }),
  
  betAmount: null,
  setBetAmount: (betAmount) => set({ betAmount }),
  
  resultMultiplier: 1.0,
  setResultMultiplier: (resultMultiplier) => set({ resultMultiplier }),
  
  profit: 0,
  setProfit: (profit) => set({ profit }),
  
  isWin: false,
  setIsWin: (isWin) => set({ isWin }),
  
  triggerRoll: (result, win, profit) => {
    set({ gameState: "ROLLING" });
    // After 0.5 seconds of fast rolling, reveal the result
    setTimeout(() => {
      set({ 
        gameState: "REVEALED", 
        resultMultiplier: result, 
        isWin: win, 
        profit: profit
      });
    }, 500);
  }
}));
