"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Connect4ConfigProps {
  onStartGame: (mode: 'pvp' | 'ai', bet: number) => void;
  balance: number;
}

export default function Connect4Config({ onStartGame, balance }: Connect4ConfigProps) {
  const [selectedMode, setSelectedMode] = useState<'pvp' | 'ai' | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(parseInt(e.target.value) || 0, balance);
    setBetAmount(value);
  };

  const handleStartGame = () => {
    if (!selectedMode || betAmount <= 0 || betAmount > balance) return;
    onStartGame(selectedMode, betAmount);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-700 border-gray-600 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Choose Game Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setSelectedMode('pvp')}
            className={`p-6 rounded-lg border-2 transition-all duration-200 ${
              selectedMode === 'pvp'
                ? 'border-green-500 bg-green-900 bg-opacity-50'
                : 'border-gray-500 bg-gray-600 hover:border-green-400'
            }`}
          >
            <h3 className="text-xl font-bold text-white mb-2">2 Player</h3>
            <p className="text-gray-200">Play against a friend on the same device</p>
          </button>

          <button
            onClick={() => setSelectedMode('ai')}
            className={`p-6 rounded-lg border-2 transition-all duration-200 ${
              selectedMode === 'ai'
                ? 'border-blue-500 bg-blue-900 bg-opacity-50'
                : 'border-gray-500 bg-gray-600 hover:border-blue-400'
            }`}
          >
            <h3 className="text-xl font-bold text-white mb-2">vs AI</h3>
            <p className="text-gray-200">Challenge the AI opponent</p>
          </button>
        </div>
      </Card>

      <Card className="bg-gray-700 border-gray-600 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Place Your Bet</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Bet Amount</label>
            <input
              type="number"
              value={betAmount}
              onChange={handleBetChange}
              min="1"
              max={balance}
              className="w-full px-4 py-2 rounded bg-gray-600 text-white border border-gray-500 focus:border-green-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[10, 50, 100, 500].map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(Math.min(amount, balance))}
                disabled={amount > balance}
                className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ${amount}
              </button>
            ))}
          </div>

          <div className="text-white">
            <p>Balance: ${balance}</p>
            <p>Potential Win: ${selectedMode === 'pvp' ? (betAmount * 1.5).toFixed(2) : (betAmount * 2).toFixed(2)}</p>
          </div>
        </div>
      </Card>

      <Button
        onClick={handleStartGame}
        disabled={!selectedMode || betAmount <= 0 || betAmount > balance}
        className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Start Game
      </Button>
    </div>
  );
}
