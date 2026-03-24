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
  const [sessionProfit, setSessionProfit] = useState(0); // Added state to fix build error

// Replace your AI move useEffect with this one:
useEffect(() => {
  const isAITurn = gameMode === 'ai' && currentPlayer === 2 && gameStarted && !gameStatus;
  
  // We only start thinking if it's the AI turn and it isn't ALREADY thinking
  if (isAITurn && !aiThinking) {
    setAiThinking(true);

    const timer = setTimeout(() => {
      try {
        const move = getAIMove(board);
        if (move !== -1) {
          makeMove(move);
        }
      } catch (err) {
        console.error("AI Error:", err);
      } finally {
        // Crucial: This must happen after the move is processed
        setAiThinking(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }
  // DO NOT add aiThinking or makeMove to this array!
}, [currentPlayer, gameMode, gameStarted, gameStatus, board]); 


   // 2. Handle Game End (Rewards & Reset to Menu)
  useEffect(() => {
    // We trigger this when gameStatus changes to 'won' or 'draw'
    if (gameStatus && gameStarted && isBetPlaced) {
      let profit = 0;
      let multiplier = 0;
      let resultText = '';

      const currentBet = betAmount || 0;

      if (gameStatus === 'won') {
        if (gameMode === 'pvp') {
          resultText = winner === 1 ? 'Player 1 Wins!' : 'Player 2 Wins!';
          multiplier = 1.5;
          profit = currentBet * multiplier;
        } else if (gameMode === 'ai') {
          if (winner === 1) {
            resultText = 'You Win!';
            multiplier = 2;
            profit = currentBet * multiplier;
          } else {
            resultText = 'AI Wins!';
            multiplier = 0;
            profit = 0;
          }
        }
      } else if (gameStatus === 'draw') {
        resultText = 'Draw!';
        multiplier = 1; // Return original bet
        profit = currentBet * multiplier;
      }

      // Update state for the UI overlay
      setSessionProfit(profit);
      setGameResult(resultText);
      setResultMultiplier(multiplier);
      
      // Update global balance
      if (profit > 0) {
        setBalance(balance + profit);
      }

      // Log to history
      addGameResult(
        'Connect 4',
        profit > currentBet ? 'Win' : profit === currentBet ? 'Draw' : 'Loss',
        profit,
        balance + profit
      );

      // Prevent this effect from running again for the same round
      setIsBetPlaced(false); 

      // Return to menu after 3 seconds
// Inside your game end useEffect timer:
const timer = setTimeout(() => {
  resetGame(); // This now sets gameStarted to false and mode to menu
  setGameResult(null);
  setResultMultiplier(0);
  setSessionProfit(0);
}, 3000);


      return () => clearTimeout(timer);
    }
  }, [gameStatus, gameStarted, isBetPlaced, winner, gameMode, betAmount, balance, resetGame, setBalance, setGameStarted, setIsBetPlaced]);


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
              <div className={`p-6 rounded-lg text-center animate-bounce ${resultMultiplier >= 1 ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                <h2 className="text-3xl font-bold">{gameResult}</h2>
                <p className="text-xl mt-2">{resultMultiplier}x Multiplier ({sessionProfit > 0 ? `+$${sessionProfit}` : '$0'})</p>
              </div>
            )}
            <Connect4Board />
            <div className="bg-gray-700 p-4 rounded-lg flex justify-between items-center border border-gray-600">
              <div className="text-left text-white">
                <p className="text-sm text-gray-400 uppercase">Current Bet</p>
                <p className="text-xl font-bold text-yellow-400">${betAmount}</p>
              </div>
              <div className="text-right text-white">
                <p className="text-sm text-gray-400 uppercase">Wallet Balance</p>
                <p className="text-xl font-bold text-green-400">${balance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
