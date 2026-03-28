"use client";

import React, { useEffect, useState } from 'react';
import { useConnect4Store } from '@/app/_store/connect4Store';
import { useCommonStore } from '@/app/_store/commonStore';
import { getAIMove } from '@/app/_lib/connect4AI';
import { addGameResult } from '@/app/_constants/data';
import Connect4Board from './Connect4Board';
import Connect4Config from './Connect4Config';

export default function Connect4Component() {
  const {
    board,
    currentPlayer,
    gameMode,
    gameStatus,
    winner,
    betAmount,
    isBetPlaced,
    gameStarted,
    aiThinking,
    makeMove,
    setAiThinking,
    setIsBetPlaced,
    resetGame,
  } = useConnect4Store();

  const { balance } = useCommonStore();
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [resultMultiplier, setResultMultiplier] = useState(0);
  const [sessionProfit, setSessionProfit] = useState(0);

  // AI turn resolver
  useEffect(() => {
    const isAITurn = gameMode === 'ai' && currentPlayer === 2 && gameStarted && !gameStatus;
    
    if (isAITurn) {
      if (!useConnect4Store.getState().aiThinking) {
        setAiThinking(true);
        setTimeout(() => {
          try {
            const currentBoard = useConnect4Store.getState().board;
            const move = getAIMove(currentBoard);
            
            // Critical Fix: Clear the thinking lock BEFORE dispatching the move, 
            // otherwise the Zustand store explicitly rejects it!
            useConnect4Store.getState().setAiThinking(false);

            if (move !== -1) {
               useConnect4Store.getState().makeMove(move);
            }
          } catch (err) {
            console.error("AI Error:", err);
            useConnect4Store.getState().setAiThinking(false);
          }
        }, 500); 
      }
    }
  }, [currentPlayer, gameMode, gameStarted, gameStatus]);

  // Game End Resolver
  useEffect(() => {
    if (gameStatus && gameStarted && isBetPlaced) {
      let profit = 0;
      let multiplier = 0;
      let resultText = '';
      const currentBet = betAmount ?? 0;

      if (gameStatus === 'won') {
        if (gameMode === 'pvp') {
          resultText = winner === 1 ? 'Player 1 Wins!' : 'Player 2 Wins!';
          multiplier = 1.5;
          profit = currentBet * multiplier;
        } else if (gameMode === 'ai') {
          if (winner === 1) {
            resultText = 'You Win!';
            multiplier = 2.0;
            profit = currentBet * multiplier;
          } else {
            resultText = 'AI Wins!';
            multiplier = 0;
            profit = 0;
          }
        }
      } else if (gameStatus === 'draw') {
        resultText = 'Draw!';
        multiplier = 1; // Recoup entry
        profit = currentBet * multiplier;
      }

      setSessionProfit(profit);
      setGameResult(resultText);
      setResultMultiplier(multiplier);
      
      const newBal = useCommonStore.getState().balance + profit;
      // We process win profit addition here directly interacting with Zustand correctly
      if (profit > 0) useCommonStore.getState().setBalance(newBal);

      addGameResult(
        'Connect 4',
        profit > currentBet ? 'Win' : profit === currentBet ? 'Draw' : 'Loss',
        profit,
        profit > 0 ? newBal : useCommonStore.getState().balance
      );

      const timer = setTimeout(() => {
        setIsBetPlaced(false);
        resetGame(); // Resets layout tracking securely
        setGameResult(null);
        setResultMultiplier(0);
        setSessionProfit(0);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [gameStatus, gameStarted, isBetPlaced, winner, gameMode, betAmount, resetGame, setIsBetPlaced]);

  return (
    <main className="flex flex-col md:flex-row gap-4 md:gap-8 p-4 w-full max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row w-full p-4 lg:p-8">
        <div className="flex justify-start w-full lg:w-1/3 p-4">
          <Connect4Config />
        </div>
        <div className="flex justify-center items-center flex-col w-full lg:w-2/3 p-4 relative">
          
          <div className="w-full flex justify-center items-center bg-[#0f172a] rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.05)] relative p-8 border border-[#1e2a36] min-h-[500px]">
             
             {!gameStarted && !gameResult && (
               <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/40 backdrop-blur-sm z-20 rounded-lg">
                 <h2 className="text-4xl font-extrabold text-[#38bdf8] mb-2 font-mono">CONNECT 4</h2>
                 <p className="text-gray-400 font-bold tracking-wider">PLACE A BET TO START CONNECTING</p>
               </div>
             )}

             {gameResult && (
               <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/60 backdrop-blur-md z-30 transition-all">
                 <h2 className={`text-5xl font-extrabold mb-4 drop-shadow-xl ${resultMultiplier > 0 ? 'text-[#4cd964]' : 'text-[#ef4444]'}`}>
                   {gameResult}
                 </h2>
                 {resultMultiplier > 0 ? (
                   <div className="flex flex-col items-center">
                     <p className="text-xl text-white font-bold mb-2">Payout</p>
                     <p className="text-3xl font-extrabold text-[#4cd964] bg-[#4cd964]/10 px-8 py-3 rounded-full ring-2 ring-[#4cd964]/50 shadow-[0_0_15px_rgba(76,217,100,0.5)]">
                       +${sessionProfit.toFixed(2)}
                     </p>
                   </div>
                 ) : (
                   <p className="text-xl text-gray-300 font-bold">
                     Better luck next time
                   </p>
                 )}
               </div>
             )}

             <Connect4Board />
          </div>

        </div>
      </div>
    </main>
  );
}
