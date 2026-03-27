import { Player } from '@/app/_store/connect4Store';

const ROWS = 6;
const COLS = 7;

// Efficient win checker
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

// Gets valid columns, starting from the center for speed
// Replace your getValidMoves function with this exact block:
const getValidMoves = (board: (Player)[][]): number[] => {
  const moves: number[] = [];
  // Column priority: 3 is center, then out to the edges
  const priority = [3, 2, 4, 1, 5, 0, 6]; 
  for (const col of priority) {
    // Check if the top row of the column is empty
    if (board[0][col] === null) {
      moves.push(col);
    }
  }
  return moves;
};


// Creates a new board state for simulation
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

// Simple heuristic for board strength
const evaluateBoard = (board: (Player)[][]): number => {
  let score = 0;
  const ai = 2;
  const human = 1;

  const checkLine = (cells: (Player)[]) => {
    let aiCount = 0;
    let humanCount = 0;
    let emptyCount = 0;

    for (let i = 0; i < 4; i++) {
       if (cells[i] === ai) aiCount++;
       else if (cells[i] === human) humanCount++;
       else emptyCount++;
    }

    if (aiCount === 4) return 10000;
    if (aiCount === 3 && emptyCount === 1) return 100;
    if (aiCount === 2 && emptyCount === 2) return 10;
    if (humanCount === 3 && emptyCount === 1) return -1000; // Block human
    return 0;
  };

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) score += checkLine([board[r][c], board[r][c+1], board[r][c+2], board[r][c+3]]);
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) score += checkLine([board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]]);
  }
  // Diagonal
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      score += checkLine([board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]]);
      score += checkLine([board[r+3][c], board[r+2][c+1], board[r+1][c+2], board[r][c+3]]);
    }
  }
  return score;
};

// Recursive Minimax with Alpha-Beta Pruning
const minimax = (board: (Player)[][], depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
  if (checkWinner(board, 2)) return 100000 - depth;
  if (checkWinner(board, 1)) return -100000 + depth;
  
  const moves = getValidMoves(board);
  if (depth >= 4 || moves.length === 0) return evaluateBoard(board);

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
  if (moves.length === 0) return -1;

  let bestScore = -Infinity;
  let bestMove = moves[0];

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
