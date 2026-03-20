import { create } from 'zustand';

type PlinkoStore = {
  betAmount: number | null;
  setBetAmount: (betAmount: number | null) => void;
  ballsToDrop: number;
  incrementBallsToDrop: () => void;
  currentBetList: number[];
  addBet: (bet: number) => void;
  popBet: () => number | undefined;
  clearPlinkoStore: () => void;
};

export const usePlinkoStore = create<PlinkoStore>()((set) => ({
  betAmount: 0,
  ballsToDrop: 0,
  currentBetList: [],
  setBetAmount: (betAmount) => set({ betAmount }),
  incrementBallsToDrop: () => set((state) => ({ ballsToDrop: state.ballsToDrop + 1 })),
  addBet: (bet) => set((state) => ({ currentBetList: [...state.currentBetList, bet] })),
  popBet: () => {
    let bet: number | undefined;
    set((state) => {
      const newList = [...state.currentBetList];
      bet = newList.shift(); // Get the oldest bet
      return { currentBetList: newList };
    });
    return bet;
  },
  clearPlinkoStore: () => set({ betAmount: null, ballsToDrop: 0, currentBetList: [] }),
}));
