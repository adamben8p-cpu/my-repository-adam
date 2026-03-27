"use client";

import React, { type ChangeEvent } from "react";
import { useConnect4Store } from "@/app/_store/connect4Store";
import { useCommonStore } from "@/app/_store/commonStore";
import { Coins, Users, Bot } from "lucide-react";

export default function Connect4Config() {
  const {
    gameMode, setGameMode,
    betAmount, setBetAmount,
    gameStarted, setGameStarted,
    isBetPlaced, setIsBetPlaced,
    initializeBoard
  } = useConnect4Store();

  const balance = useCommonStore((state) => state.balance);
  const setBalance = useCommonStore((state) => state.setBalance);

  const handleBetAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const amount = value === "" ? null : Number(value);
    setBetAmount(amount);
  };

  const currentBet = typeof betAmount === 'number' ? betAmount : 0;
  // Based on old logic: PVP pays 1.5x, AI pays 2.0x
  const multiplier = gameMode === 'pvp' ? 1.5 : 2.0;
  const potentialProfit = currentBet > 0 ? (currentBet * multiplier).toFixed(2) : "0.00";

  const handleStartClick = () => {
    if (gameStarted) return;
    const bal = balance ?? 0;

    if (currentBet <= 0 || currentBet > bal) {
      alert("Invalid bet or insufficient balance");
      return;
    }

    if (gameMode === "menu") {
      alert("Select a game mode");
      return;
    }

    setBalance(bal - currentBet);
    initializeBoard();
    setGameStarted(true);
    setIsBetPlaced(true);
  };

  const isFormDisabled = gameStarted;
  const isBetButtonDisabled = isFormDisabled || currentBet <= 0 || (balance !== undefined && currentBet > balance) || gameMode === "menu";

  const ModeIcon = ({ mode, icon: Icon, label }: { mode: 'pvp' | 'ai', icon: any, label: string }) => (
    <button
      disabled={isFormDisabled}
      onClick={() => setGameMode(mode)}
      className={`flex-1 flex justify-center items-center gap-2 py-4 transition-colors border-r border-[#1e2a36] last:border-0 ${
        gameMode === mode ? "bg-[#334155] text-white" : "text-gray-400 hover:text-white hover:bg-[#1e2a36]"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Icon size={20} />
      <span className="font-bold">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-6 p-4 text-white w-full max-w-md mx-auto rounded-lg">
      
      {/* Bet Amount */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-[#b0b9d2]">Bet Amount</span>
          <span className="text-white font-mono">
            ${balance !== undefined ? balance.toFixed(2) : "0.00"}
          </span>
        </div>
        <div className="flex bg-[#1e2a36] rounded-md overflow-hidden shadow-inner">
          <div className="flex-1 flex items-center relative">
            <input
              type="number"
              value={betAmount !== null ? betAmount : ""}
              min={1}
              onChange={handleBetAmountChange}
              disabled={isFormDisabled}
              className="w-full bg-[#1e2a36] px-3 py-3 outline-none disabled:opacity-50"
            />
            <div className="absolute right-3 pointer-events-none">
              <Coins className="w-4 h-4 text-success" />
            </div>
          </div>
          <button
            className="bg-[#1e2a36] font-bold px-6 border-l border-[#2c3a47] hover:bg-[#2c3a47] transition-colors disabled:opacity-50"
            onClick={() => betAmount && betAmount > 0 && setBetAmount(betAmount / 2)}
            disabled={isFormDisabled}
          >
            ½
          </button>
          <button
            className="bg-[#1e2a36] font-bold px-6 border-l border-[#2c3a47] hover:bg-[#2c3a47] transition-colors disabled:opacity-50"
            onClick={() => betAmount && betAmount > 0 && setBetAmount(betAmount * 2)}
            disabled={isFormDisabled}
          >
            2×
          </button>
        </div>
        {betAmount !== null && balance !== undefined && betAmount > balance && (
          <p className="mt-1 text-sm font-medium text-red-500">
            Insufficient balance!
          </p>
        )}
      </div>

      {/* Mode Controls */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-[#b0b9d2]">Opponent</span>
        </div>
        <div className="flex bg-[#0f172a] rounded-md overflow-hidden border border-[#1e2a36]">
          <ModeIcon mode="ai" icon={Bot} label="vs AI" />
          <ModeIcon mode="pvp" icon={Users} label="2 Player" />
        </div>
      </div>

      {/* Profit on Win */}
      <div className="flex justify-between py-2 border-t border-[#1e2a36]">
        <span className="text-[#b0b9d2]">Potential Win</span>
        <span className="text-success font-bold">${potentialProfit}</span>
      </div>

      {/* Action Button */}
      {gameStarted ? (
        <button
          disabled
          className="w-full bg-orange-500 text-black font-medium py-4 rounded-md opacity-80 shadow-lg"
        >
          Game In Progress...
        </button>
      ) : (
        <button
          onClick={handleStartClick}
          disabled={isBetButtonDisabled}
          className="w-full bg-[#4cd964] hover:bg-[#3cc153] disabled:bg-[#2c3a47] disabled:text-gray-400 text-black font-extrabold text-lg py-4 rounded-md transition-colors shadow-lg"
        >
          Play Connect 4
        </button>
      )}
    </div>
  );
}
