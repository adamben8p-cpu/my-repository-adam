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
    initializeBoard,
    setGameMode,
    setGameStarted,
    setAiThinking,
    setIsBetPlaced,
    resetGame,
  } = useConnect4Store();

  const { balance, setBalance } = useCommonStore();
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [resultMultiplier, setResultMultiplier] = useState(0);

  // Handle AI move
// Replace your AI move useEffect with this:
useEffect(() => {
  const isAITurn = gameMode === 'ai' && currentPlayer === 2 && gameStarted && !gameStatus;
  
  if (isAITurn && !aiThinking) {
    setAiThinking(true);

    // Use a small timeout so the UI has a chance to render the "Thinking" state
    const timer = setTimeout(() => {
      try {
        const move = getAIMove(board);
        if (move !== -1) {
          makeMove(move);
        }
      } catch (error) {
        console.error("AI Error:", error);
      } finally {
        setAiThinking(false);
      }
    }, 500); // 500ms is enough to feel "natural"

    return () => clearTimeout(timer);
  }
}, [currentPlayer, gameMode, gameStarted, gameStatus, board]); 
// NOTE: Removed aiThinking and makeMove from dependencies to stop the loop


  // Handle game end
  useEffect(() => {
    if (gameStatus && gameStarted && isBetPlaced) {
      let profit = 0;
      let multiplier = 0;
      let resultText = '';

      if (gameStatus === 'won') {
        if (gameMode === 'pvp') {
          if (winner === 1) {
            resultText = 'Player 1 Wins!';
            profit = betAmount! * 1.5;
            multiplier = 1.5;
          } else {
            resultText = 'Player 2 Wins!';
            profit = betAmount! * 1.5;
            multiplier = 1.5;
          }
        } else if (gameMode === 'ai') {
          if (winner === 1) {
            resultText = 'You Win!';
            profit = betAmount! * 2;
            multiplier = 2;
          } else {
            resultText = 'AI Wins!';
            profit = 0;
            multiplier = 0;
          }
        }
      } else if (gameStatus === 'draw') {
        resultText = 'Draw!';
        profit = betAmount! * 0.5;
        multiplier = 0.5;
      }

      const newBalance = balance + profit - (betAmount || 0);
      setBalance(newBalance);

      addGameResult(
        'Connect 4',
        profit > 0 ? 'Win' : profit === 0 && gameStatus === 'draw' ? 'Draw' : 'Loss',
        profit,
        newBalance
      );

      setGameResult(resultText);
      setResultMultiplier(multiplier);

      const timer = setTimeout(() => {
        resetGame();
        setGameResult(null);
        setResultMultiplier(0);
        setIsBetPlaced(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [gameStatus, gameStarted, isBetPlaced, winner, gameMode, balance, setBalance, betAmount, resetGame, setIsBetPlaced]);

  const handleStartGame = (mode: 'pvp' | 'ai', bet: number) => {
    if (balance < bet) return;

    setBalance(balance - bet);
    setGameMode(mode);
    initializeBoard();
    setGameStarted(true);
    setIsBetPlaced(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Connect 4 Casino</h1>

        {!gameStarted ? (
          <Connect4Config onStartGame={handleStartGame} balance={balance} />
        ) : (
          <div className="space-y-6">
            {gameResult && (
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-lg text-center">
                <h2 className="text-3xl font-bold">{gameResult}</h2>
                <p className="text-xl mt-2">{resultMultiplier}x Multiplier</p>
              </div>
            )}

            <Connect4Board />

            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-lg text-white">Bet: ${betAmount}</p>
              <p className="text-lg text-white">Balance: ${balance}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
