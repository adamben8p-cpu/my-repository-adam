import { create } from 'zustand';

export type Obstacle = { type: "add" | "mult" | "rocket", value: number };

type GameState = "IDLE" | "FLYING" | "GAMEOVER";

type AviaStore = {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  
  betAmount: number | null;
  setBetAmount: (val: number | null) => void;
  
  currentMultiplier: number;
  setCurrentMultiplier: (val: number) => void;
  
  altitude: number;
  setAltitude: (val: number) => void;
  
  distance: number;
  setDistance: (val: number) => void;
  
  speed: number; // 1, 2, 3, 4
  setSpeed: (val: number) => void;
  
  flightPath: Obstacle[];
  targetLanded: boolean;
  
  profit: number;
  isWin: boolean;
  
  triggerFlight: (path: Obstacle[], landed: boolean) => void;
  endFlight: (win: boolean, profit: number) => void;
};

export const useAviaStore = create<AviaStore>()((set) => ({
  gameState: "IDLE",
  setGameState: (s) => set({ gameState: s }),
  
  betAmount: null,
  setBetAmount: (b) => set({ betAmount: b }),
  
  currentMultiplier: 1.0,
  setCurrentMultiplier: (m) => set({ currentMultiplier: m }),
  
  altitude: 3,
  setAltitude: (a) => set({ altitude: a }),
  
  distance: 0,
  setDistance: (d) => set({ distance: d }),
  
  speed: 1, // default speed
  setSpeed: (s) => set({ speed: s }),
  
  flightPath: [],
  targetLanded: false,
  
  profit: 0,
  isWin: false,
  
  triggerFlight: (path, landed) => set({
    gameState: "FLYING",
    flightPath: path,
    targetLanded: landed,
    currentMultiplier: 1.0,
    altitude: 3,
    distance: 0,
    profit: 0,
    isWin: false,
  }),
  
  endFlight: (win, profit) => set({
    gameState: "GAMEOVER",
    isWin: win,
    profit
  })
}));
