import { Player } from '@/app/_store/connect4Store';

const ROWS = 6;
const COLS = 7;

// Pre-compute winning configurations for instant iteration (O(n) time)
const WINNING_LINES: number[][][] = [];

// Horizontal
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS - 3; c++) {
    WINNING_LINES.push([[r, c], [r, c+1], [r, c+2], [r, c+3]]);
  }
}
// Vertical
for (let r = 0; r < ROWS - 3; r++) {
  for (let c = 0; c < COLS; c++) {
    WINNING_LINES.push([[r, c], [r+1, c], [r+2, c], [r+3, c]]);
  }
}
// Diagonals
for (let r = 0; r < ROWS - 3; r++) {
  for (let c = 0; c < COLS - 3; c++) {
    WINNING_LINES.push([[r, c], [r+1, c+1], [r+2, c+2], [r+3, c+3]]);
    WINNING_LINES.push([[r+3, c], [r+2, c+1], [r+1, c+2], [r, c+3]]);
  }
}

// Fixed constant matrix to prioritize the center column natively, 
// ensuring the AI controls the middle of the board strategically like a human.
const POSITION_SCORES = [
  [3, 4, 5, 7, 5, 4, 3],
  [4, 6, 8, 10, 8, 6, 4],
  [5, 8, 11, 13, 11, 8, 5],
  [5, 8, 11, 13, 11, 8, 5],
  [4, 6, 8, 10, 8, 6, 4],
  [3, 4, 5, 7, 5, 4, 3]
];

export const getAIMove = (board: (Player)[][]): number => {
  const ai = 2;
  const human = 1;

  const validCols = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === null) validCols.push(c);
  }

  if (validCols.length === 0) return -1;

  // Utility to find the floor of a column
  const getNextOpenRow = (b: (Player)[][], c: number) => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (b[r][c] === null) return r;
    }
    return -1;
  };

  const checkWin = (b: (Player)[][], piece: number) => {
    for (let i = 0; i < WINNING_LINES.length; i++) {
        const line = WINNING_LINES[i];
        if (b[line[0][0]][line[0][1]] === piece &&
            b[line[1][0]][line[1][1]] === piece &&
            b[line[2][0]][line[2][1]] === piece &&
            b[line[3][0]][line[3][1]] === piece) {
            return true;
        }
    }
    return false;
  };

  // Phase 1: Offensive Execution
  // Check if AI can win immediately on this turn.
  for (const c of validCols) {
    const r = getNextOpenRow(board, c);
    board[r][c] = ai;
    const wins = checkWin(board, ai);
    board[r][c] = null; // Revert change
    if (wins) return c;
  }

  // Phase 2: Defensive Execution
  // Check if the Human player is threatening an immediate win, and block it.
  for (const c of validCols) {
    const r = getNextOpenRow(board, c);
    board[r][c] = human;
    const wins = checkWin(board, human);
    board[r][c] = null; // Revert change
    if (wins) return c;
  }

  // Phase 3: Positional Heuristic
  // Use a combination of board placement arrays and future-setup counting.
  let bestScore = -Infinity;
  let bestCol = validCols[Math.floor(Math.random() * validCols.length)];

  for (const c of validCols) {
    const r = getNextOpenRow(board, c);
    let score = POSITION_SCORES[r][c]; // Inherit strategic board dominance points

    // Simulate placing piece
    board[r][c] = ai;
    
    // Check how many tactical setups this move generates
    for (let i = 0; i < WINNING_LINES.length; i++) {
        const line = WINNING_LINES[i];
        let aiCount = 0;
        let emptyCount = 0;
        
        for (let j = 0; j < 4; j++) {
            const piece = board[line[j][0]][line[j][1]];
            if (piece === ai) aiCount++;
            else if (piece === null) emptyCount++;
        }
        
        if (aiCount === 3 && emptyCount === 1) score += 50; // Approaching win
        if (aiCount === 2 && emptyCount === 2) score += 10; // Building structure
    }
    
    // Add jitter so the AI doesn't repeat identically predictable opening moves endlessly
    score += Math.random() * 2;

    board[r][c] = null; // Revert change

    if (score > bestScore) {
      bestScore = score;
      bestCol = c;
    }
  }

  return bestCol;
};
