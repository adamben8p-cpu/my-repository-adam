import { Player } from '@/app/_store/connect4Store';

const ROWS = 6;
const COLS = 7;

const checkWinner = (board: (Player)[][], player: Player): boolean => {
  // Check horizontal
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (board[row][col] === player &&
          board[row][col + 1] === player &&
          board[row][col + 2] === player &&
          board[row][col + 3] === player) {
        return true;
      }
    }
  }

  // Check vertical
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS - 3; row++) {
      if (board[row][col] === player &&
          board[row + 1][col] === player &&
          board[row + 2][col] === player &&
          board[row + 3][col] === player) {
        return true;
      }
    }
  }

  // Check diagonal (bottom-left to top-right)
  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (board[row][col] === player &&
          board[row - 1][col + 1] === player &&
          board[row - 2][col + 2] === player &&
          board[row - 3][col + 3] === player) {
        return true;
      }
    }
  }

  // Check diagonal (top-left to bottom-right)
  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (board[row][col] === player &&
          board[row + 1][col + 1] === player &&
          board[row + 2][col + 2] === player &&
          board[row + 3][col + 3] === player) {
        return true;
      }
    }
  }

  return false;
};

const getValidMoves = (board: (Player)[][]): number[] => {
  const moves: number[] = [];
  for (let col = 0; col < COLS; col++) {
    if (board[0][col] === null) {
      moves.push(col);
    }
  }
  return moves;
};

const makeMove = (board: (Player)[][], column: number, player: Player): (Player)[][] | null => {
  const newBoard = board.map(row => [...row]);

  if (column < 0 || column >= COLS || newBoard[0][column] !== null) {
    return null;
  }

  for (let row = ROWS - 1; row >= 0; row--) {
    if (newBoard[row][column] === null) {
      newBoard[row][column] = player;
      return newBoard;
    }
  }

  return null;
};

const countThreats = (board: (Player)[][], player: Player): number => {
  let score = 0;

  // Horizontal
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const cells = [board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3]];
      const playerCount = cells.filter(c => c === player).length;
      const emptyCount = cells.filter(c => c === null).length;

      if (playerCount > 0 && emptyCount > 0) {
        score += Math.pow(playerCount, 2);
      }
    }
  }

  // Vertical
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS - 3; row++) {
      const cells = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
      const playerCount = cells.filter(c => c === player).length;
      const emptyCount = cells.filter(c => c === null).length;

      if (playerCount > 0 && emptyCount > 0) {
        score += Math.pow(playerCount, 2);
      }
    }
  }

  // Diagonals
  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const cells = [board[row][col], board[row - 1][col + 1], board[row - 2][col + 2], board[row - 3][col + 3]];
      const playerCount = cells.filter(c => c === player).length;
      const emptyCount = cells.filter(c => c === null).length;

      if (playerCount > 0 && emptyCount > 0) {
        score += Math.pow(playerCount, 2);
      }
    }
  }

  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const cells = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
      const playerCount = cells.filter(c => c === player).length;
      const emptyCount = cells.filter(c => c === null).length;

      if (playerCount > 0 && emptyCount > 0) {
        score += Math.pow(playerCount, 2);
      }
    }
  }

  return score;
};

const evaluateBoard = (board: (Player)[][]): number => {
  if (checkWinner(board, 2)) return 1000;
  if (checkWinner(board, 1)) return -1000;

  const aiScore = countThreats(board, 2);
  const playerScore = countThreats(board, 1);

  return aiScore - playerScore;
};

const minimax = (board: (Player)[][], depth: number, isMaximizing: boolean, maxDepth: number = 5): number => {
  if (depth === maxDepth || checkWinner(board, 1) || checkWinner(board, 2)) {
    return evaluateBoard(board);
  }

  const validMoves = getValidMoves(board);

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const col of validMoves) {
      const newBoard = makeMove(board, col, 2);
      if (newBoard) {
        const score = minimax(newBoard, depth + 1, false, maxDepth);
        maxScore = Math.max(score, maxScore);
      }
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const col of validMoves) {
      const newBoard = makeMove(board, col, 1);
      if (newBoard) {
        const score = minimax(newBoard, depth + 1, true, maxDepth);
        minScore = Math.min(score, minScore);
      }
    }
    return minScore;
  }
};

export const getAIMove = (board: (Player)[][]): number => {
  const validMoves = getValidMoves(board);

  if (validMoves.length === 0) return -1;

  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  for (const col of validMoves) {
    const newBoard = makeMove(board, col, 2);
    if (newBoard) {
      const score = minimax(newBoard, 0, false, 5);
      if (score > bestScore) {
        bestScore = score;
        bestMove = col;
      }
    }
  }

  return bestMove;
};
