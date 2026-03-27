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
    <div className="flex flex-col items-center justify-center gap-6 w-full h-full max-w-full">
      <div className="flex justify-between w-full max-w-[650px] px-4 font-bold text-lg sm:text-xl md:text-2xl">
         <span className={`transition-all duration-300 ${currentPlayer === 1 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] scale-110' : 'text-gray-600 opacity-50'}`}>
            PLAYER 1 (Yellow)
         </span>
         <span className={`transition-all duration-300 ${currentPlayer === 2 ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] scale-110' : 'text-gray-600 opacity-50'}`}>
            {gameMode === 'ai' ? 'AI (Red)' : 'PLAYER 2 (Red)'}
         </span>
      </div>

      <div className="grid gap-2 sm:gap-3 p-4 sm:p-5 md:p-6 bg-[#1e293b] rounded-2xl border-[6px] border-[#334155] shadow-2xl shrink-0">
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-2 sm:gap-3">
            {row.map((cell, colIdx) => (
              <button
                key={`${rowIdx}-${colIdx}`}
                onClick={() => handleColumnClick(colIdx)}
                disabled={gameStatus !== null || aiThinking || (gameMode === 'ai' && currentPlayer === 2)}
                className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-full transition-all duration-300 flex items-center justify-center shadow-inner shrink-0 ${
                  cell === null
                    ? 'bg-[#0f172a] hover:bg-[#334155] cursor-pointer ring-[2px] ring-inset ring-black/40'
                    : cell === 1
                    ? 'bg-yellow-400 shadow-[0_5px_15px_rgba(250,204,21,0.6)] border-t-2 border-yellow-200'
                    : 'bg-red-500 shadow-[0_5px_15px_rgba(239,68,68,0.6)] border-t-2 border-red-300'
                }`}
              >
                {cell && (
                  <div className={`w-[70%] h-[70%] rounded-full ${cell === 1 ? 'bg-yellow-300' : 'bg-red-400'} shadow-[inset_0_3px_6px_rgba(0,0,0,0.3)] opacity-80`} />
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
      
      {aiThinking && (
        <p className="text-gray-400 text-sm font-bold tracking-widest animate-pulse absolute bottom-4">
          GENERATING MOVE...
        </p>
      )}
    </div>
  );
}
