import { create } from 'zustand';

export type Player = 1 | 2 | null;
export type GameMode = 'menu' | 'pvp' | 'ai';
export type GameStatus = 'playing' | 'won' | 'draw';

type Connect4Store = {
  board: Player[][];
  currentPlayer: Player;
  gameMode: GameMode;
  gameStatus: GameStatus | null;
  winner: Player | null;
  betAmount: number | null;
  isBetPlaced: boolean;
  gameStarted: boolean;
  aiThinking: boolean;

  initializeBoard: () => void;
  setGameMode: (mode: GameMode) => void;
  setGameStatus: (status: GameStatus | null) => void;
  setWinner: (winner: Player) => void;
  setBetAmount: (amount: number | null) => void;
  setIsBetPlaced: (placed: boolean) => void;
  setGameStarted: (started: boolean) => void;
  setAiThinking: (thinking: boolean) => void;

  makeMove: (column: number) => void;
  resetGame: () => void;
  switchPlayer: () => void;
};

const ROWS = 6;
const COLS = 7;

const createEmptyBoard = (): Player[][] => {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
};

const checkWinner = (board: Player[][]): Player | null => {
  // Check horizontal
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const cells = [board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3]];
      if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
        return cells[0];
      }
    }
  }

  // Check vertical
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS - 3; row++) {
      const cells = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
      if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
        return cells[0];
      }
    }
  }

  // Check diagonal (bottom-left to top-right)
  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const cells = [board[row][col], board[row - 1][col + 1], board[row - 2][col + 2], board[row - 3][col + 3]];
      if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
        return cells[0];
      }
    }
  }

  // Check diagonal (top-left to bottom-right)
  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const cells = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
      if (cells[0] !== null && cells.every(cell => cell === cells[0])) {
        return cells[0];
      }
    }
  }

  return null;
};

const isBoardFull = (board: Player[][]): boolean => {
  return board.every(row => row.every(cell => cell !== null));
};

export const useConnect4Store = create<Connect4Store>()((set) => ({
  board: createEmptyBoard(),
  currentPlayer: 1,
  gameMode: 'menu',
  gameStatus: null,
  winner: null,
  betAmount: null,
  isBetPlaced: false,
  gameStarted: false,
  aiThinking: false,

  initializeBoard: () => set({ board: createEmptyBoard() }),

  setGameMode: (mode) => set({ gameMode: mode }),

  setGameStatus: (status) => set({ gameStatus: status }),

  setWinner: (winner) => set({ winner }),

  setBetAmount: (amount) => set({ betAmount: amount }),

  setIsBetPlaced: (placed) => set({ isBetPlaced: placed }),

  setGameStarted: (started) => set({ gameStarted: started }),

  setAiThinking: (thinking) => set({ aiThinking: thinking }),

  // ... inside your useConnect4Store ...

  makeMove: (column: number) => {
    set((state) => {
      // 1. Block moves if game is over or AI is thinking
      if (state.gameStatus || state.aiThinking) return state;

      const newBoard = state.board.map(row => [...row]);
      if (column < 0 || column >= COLS || newBoard[0][column] !== null) return state;

      for (let row = ROWS - 1; row >= 0; row--) {
        if (newBoard[row][column] === null) {
          newBoard[row][column] = state.currentPlayer;

          const winPlayer = checkWinner(newBoard);
          if (winPlayer) {
            return {
              board: newBoard,
              gameStatus: 'won' as GameStatus,
              winner: winPlayer,
            };
          }

          if (isBoardFull(newBoard)) {
            return {
              board: newBoard,
              gameStatus: 'draw' as GameStatus,
            };
          }

          return {
            board: newBoard,
            currentPlayer: state.currentPlayer === 1 ? 2 : 1,
          };
        }
      }
      return state;
    });
  },

  resetGame: () => set({
    board: createEmptyBoard(),
    currentPlayer: 1,
    gameStatus: null,
    winner: null,
    gameMode: 'menu',
    gameStarted: false, // CRUCIAL: This triggers the menu to show up
    isBetPlaced: false,
    aiThinking: false,
    // Note: we keep betAmount as is so the user doesn't have to re-type it
  }),

// ... rest of store


  switchPlayer: () => set((state) => ({
    currentPlayer: state.currentPlayer === 1 ? 2 : 1,
  })),
}));
