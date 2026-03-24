"use client";

import React from 'react';
import { useConnect4Store } from '@/app/_store/connect4Store';

export default function Connect4Board() {
  const { board, currentPlayer, gameStatus, makeMove, gameMode, aiThinking } = useConnect4Store();

  const handleColumnClick = (col: number) => {
    if (gameStatus || aiThinking) return;
    if (gameMode === 'ai' && currentPlayer === 2) return;

    makeMove(col);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="grid gap-2 p-4 bg-gradient-to-b from-blue-600 to-blue-800 rounded-lg">
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-2">
            {row.map((cell, colIdx) => (
              <button
                key={`${rowIdx}-${colIdx}`}
                onClick={() => handleColumnClick(colIdx)}
                disabled={gameStatus !== null || aiThinking || (gameMode === 'ai' && currentPlayer === 2)}
                className={`w-16 h-16 rounded-full transition-all duration-200 flex items-center justify-center border-2 border-blue-900 ${
                  cell === null
                    ? 'bg-blue-400 hover:bg-blue-300 cursor-pointer'
                    : cell === 1
                    ? 'bg-yellow-400'
                    : 'bg-red-500'
                }`}
              >
                {cell && (
                  <div className={`w-12 h-12 rounded-full ${cell === 1 ? 'bg-yellow-300' : 'bg-red-400'}`} />
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="text-center">
        {gameStatus === 'won' ? (
          <p className="text-2xl font-bold text-green-500">
            {board.some(row => row.some(cell => cell !== null)) ? `Player ${board.flat().filter(c => c !== null).length % 2 === 0 ? 1 : 2} Wins!` : 'Player Wins!'}
          </p>
        ) : gameStatus === 'draw' ? (
          <p className="text-2xl font-bold text-yellow-500">It&apos;s a Draw!</p>
        ) : (
          <p className="text-lg font-semibold text-gray-200">
            {gameMode === 'ai' && currentPlayer === 2 ? 'AI is thinking...' : `Current Player: ${currentPlayer}`}
          </p>
        )}
      </div>
    </div>
  );
}
