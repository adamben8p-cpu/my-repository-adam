import { Player } from '@/app/_store/connect4Store';

const ROWS = 6;
const COLS = 7;

// Helper to check for a winner efficiently
const checkWinner = (board: (Player)[][], player: Player): boolean => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;
      // Horizontal
      if (c + 3 < COLS && board[r][c+1] === player && board[r][c+2] === player && board[r][c+3] === player) return true;
      // Vertical
      if (r + 3 < ROWS && board[r+1][c] === player && board[r+2][c] === player && board[r+3][c] === player) return true;
      // Diagonal Down-Right
      if (r + 3 < ROWS && c + 3 < COLS && board[r+1][c+1] === player && board[r+2][c+2] === player && board[r+3][c+3] === player) return true;
      // Diagonal Up-Right
      if (r - 3 >= 0 && c + 3 < COLS && board[r-1][c+1] === player && board[r-2][c+2] === player && board[r-3][c+3] === player) return true;
    }
  }
  return false;
};

// Returns columns in order of importance (Center is best in Connect 4)
const getValidMoves = (board: (Player)[][]): number[] => {
  const centerOrder = [3, 2, 4, 1, 5, 0, 6];
  return centerOrder.filter(col => board[0][col] === null);
};

const makeMove = (board: (Player)[][], column: number, player: Player): (Player)[][] | null => {
  const newBoard = board.map(row => [...row]);
  for (let row = ROWS - 1; row >= 0; row--) {
    if (newBoard[row][column] === null) {
      newBoard[row][column] = player;
      return newBoard;
    }
  }
  return null;
};

// Evaluates a window of 4 cells for scoring
const evaluateWindow = (window: (Player)[], player: Player): number => {
  const opponent = player === 1 ? 2 : 1;
  let score = 0;

  const playerCount = window.filter(c => c === player).length;
  const emptyCount = window.filter(c => c === null).length;
  const oppCount = window.filter(c => c === opponent).length;

  if (playerCount === 4) score += 10000;
  else if (playerCount === 3 && emptyCount === 1) score += 100;
  else if (playerCount === 2 && emptyCount === 2) score += 10;

  if (oppCount === 3 && emptyCount === 1) score -= 80; // Block opponent

  return score;
};

const evaluateBoard = (board: (Player)[][]): number => {
  let score = 0;

  // Score Center Column (highly valuable)
  const centerArray = board.map(row => row[3]);
  const centerCount = centerArray.filter(c => c === 2).length;
  score += centerCount * 3;

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      score += evaluateWindow(board[r].slice(c, c + 4), 2);
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      const window = [board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]];
      score += evaluateWindow(window, 2);
    }
  }
  // Diagonals
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const d1 = [board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]];
      const d2 = [board[r+3][c], board[r+2][c+1], board[r+1][c+2], board[r][c+3]];
      score += evaluateWindow(d1, 2);
      score += evaluateWindow(d2, 2);
    }
  }
  return score;
};

const minimax = (
  board: (Player)[][], 
  depth: number, 
  alpha: number, 
  beta: number, 
  isMaximizing: boolean, 
  maxDepth: number
): number => {
  const isWinnerAI = checkWinner(board, 2);
  const isWinnerPlayer = checkWinner(board, 1);
  const moves = getValidMoves(board);

  if (depth === maxDepth || isWinnerAI || isWinnerPlayer || moves.length === 0) {
    if (isWinnerAI) return 1000000 - depth; // Win faster
    if (isWinnerPlayer) return -1000000 + depth; // Delay loss
    return evaluateBoard(board);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const col of moves) {
      const nextBoard = makeMove(board, col, 2);
      if (nextBoard) {
        const evaluation = minimax(nextBoard, depth + 1, alpha, beta, false, maxDepth);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Alpha-Beta Pruning
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const col of moves) {
      const nextBoard = makeMove(board, col, 1);
      if (nextBoard) {
        const evaluation = minimax(nextBoard, depth + 1, alpha, beta, true, maxDepth);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Alpha-Beta Pruning
      }
    }
    return minEval;
  }
};

export const getAIMove = (board: (Player)[][]): number => {
  const validMoves = getValidMoves(board);
  if (validMoves.length === 0) return -1;

  let bestMove = validMoves[0];
  let bestScore = -Infinity;
  
  // Set depth to 6 for a smart, fast AI. 7+ might lag without bitboards.
  const SEARCH_DEPTH = 6; 

  for (const col of validMoves) {
    const nextBoard = makeMove(board, col, 2);
    if (nextBoard) {
      const score = minimax(nextBoard, 0, -Infinity, Infinity, false, SEARCH_DEPTH);
      if (score > bestScore) {
        bestScore = score;
        bestMove = col;
      }
    }
  }

  return bestMove;
};
