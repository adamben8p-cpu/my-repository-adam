import { Player } from '@/app/_store/connect4Store';

const ROWS = 6;
const COLS = 7;

const checkWinner = (board: (Player)[][], player: Player): boolean => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;
      if (c + 3 < COLS && board[r][c+1] === player && board[r][c+2] === player && board[r][c+3] === player) return true;
      if (r + 3 < ROWS && board[r+1][c] === player && board[r+2][c] === player && board[r+3][c] === player) return true;
      if (r + 3 < ROWS && c + 3 < COLS && board[r+1][c+1] === player && board[r+2][c+2] === player && board[r+3][c+3] === player) return true;
      if (r - 3 >= 0 && c + 3 < COLS && board[r-1][c+1] === player && board[r-2][c+2] === player && board[r-3][c+3] === player) return true;
    }
  }
  return false;
};

const getValidMoves = (board: (Player)[][]): number[] => {
  const moves: number[] = [];
  // Standard Connect 4 priority: Center columns first for better pruning
  const priority = [3, 2, 4, 1, 5, 0, 6]; 
  for (const col of priority) {
    if (board[0][col] === null) moves.push(col);
  }
  return moves;
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

const evaluateBoard = (board: (Player)[][]): number => {
  // Simple heuristic: count potential lines
  let score = 0;
  const player = 2; // AI
  const opponent = 1;

  const checkLine = (a: Player, b: Player, c: Player, d: Player) => {
    const cells = [a, b, c, d];
    const pCount = cells.filter(x => x === player).length;
    const oCount = cells.filter(x => x === opponent).length;
    const eCount = cells.filter(x => x === null).length;

    if (pCount === 4) return 10000;
    if (pCount === 3 && eCount === 1) return 100;
    if (pCount === 2 && eCount === 2) return 10;
    if (oCount === 3 && eCount === 1) return -1000; // High priority to block
    return 0;
  };

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) score += checkLine(board[r][c], board[r][c+1], board[r][c+2], board[r][c+3]);
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) score += checkLine(board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]);
  }
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      score += checkLine(board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]);
      score += checkLine(board[r+3][c], board[r+2][c+1], board[r+1][c+2], board[r][c+3]);
    }
  }
  return score;
};

const minimax = (board: (Player)[][], depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
  if (checkWinner(board, 2)) return 100000 - depth;
  if (checkWinner(board, 1)) return -100000 + depth;
  const moves = getValidMoves(board);
  if (depth >= 5 || moves.length === 0) return evaluateBoard(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const col of moves) {
      const next = makeMove(board, col, 2);
      if (next) {
        const ev = minimax(next, depth + 1, alpha, beta, false);
        maxEval = Math.max(maxEval, ev);
        alpha = Math.max(alpha, ev);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const col of moves) {
      const next = makeMove(board, col, 1);
      if (next) {
        const ev = minimax(next, depth + 1, alpha, beta, true);
        minEval = Math.min(minEval, ev);
        beta = Math.min(beta, ev);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
};

export const getAIMove = (board: (Player)[][]): number => {
  const moves = getValidMoves(board);
  let bestScore = -Infinity;
  let bestMove = moves[0] ?? -1;

  for (const col of moves) {
    const next = makeMove(board, col, 2);
    if (next) {
      const score = minimax(next, 0, -Infinity, Infinity, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = col;
      }
    }
  }
  return bestMove;
};
