"use client";
import React, { type ChangeEvent } from "react";
import { useCrashStore } from "@/app/_store/crashStore";
import { useCommonStore } from "@/app/_store/commonStore";
import { Coins } from "lucide-react";

export default function CrashConfig() {
  const { 
    betAmount, setBetAmount, 
    isBetPlaced, setIsBetPlaced,
    gameState, currentMultiplier,
    hasCashedOut, setHasCashedOut,
    setProfit 
  } = useCrashStore();
  
  const balance = useCommonStore((state) => state.balance);
  const setBalance = useCommonStore((state) => state.setBalance);

  const handleBetAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const amount = value === "" ? null : Number(value);
    setBetAmount(amount);
  };

  const currentProfit = betAmount ? (betAmount * currentMultiplier).toFixed(2) : "0.00";

  const handleBetClick = () => {
    if (gameState !== "WAITING") return;
    const amount = typeof betAmount === 'number' ? betAmount : 0;
    const bal = balance ?? 0;
    
    if (amount <= 0 || amount > bal) {
      alert("Invalid bet or insufficient balance");
      return;
    }

    setBalance(bal - amount);
    setIsBetPlaced(true);
    setHasCashedOut(false);
    setProfit(0);
  };

  const handleCashOutClick = () => {
    if (gameState !== "PLAYING" || !isBetPlaced || hasCashedOut) return;
    
    const amount = typeof betAmount === 'number' ? betAmount : 0;
    const winAmount = parseFloat((amount * currentMultiplier).toFixed(2));
    
    setHasCashedOut(true);
    setProfit(winAmount);
    
    const bal = balance ?? 0;
    setBalance(bal + winAmount);
  };

  const handleDisabledBetClick = () => {
    const currentBalance = balance ?? 0;
    if (betAmount !== null && betAmount > currentBalance) {
      alert("You don't have enough balance");
    }
  };

  const isBetFormDisabled = isBetPlaced || gameState !== "WAITING";
  const isBetButtonDisabled = isBetFormDisabled || betAmount === null || betAmount <= 0 || (balance !== undefined && betAmount > balance);

  return (
    <div className="flex flex-col gap-6 p-4 text-white w-full max-w-md mx-auto rounded-lg">
      {/* Bet Amount */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-[#b0b9d2]">Bet Amount</span>
          <span className="text-white">
            ${balance !== undefined ? balance.toFixed(2) : "0.00"}
          </span>
        </div>
        <div className="flex bg-[#1e2a36] rounded-md overflow-hidden">
          <div className="flex-1 flex items-center relative">
            <input
              type="number"
              id="betAmount"
              value={betAmount !== null ? betAmount : ""}
              min={1}
              onChange={handleBetAmountChange}
              disabled={isBetFormDisabled}
              className="w-full bg-[#1e2a36] px-3 py-3 outline-none disabled:opacity-50"
              onClick={(e) => !isBetFormDisabled && e.currentTarget.select()}
            />
            <div className="absolute right-3 pointer-events-none">
              <Coins className="w-4 h-4 text-success" />
            </div>
          </div>
          <button
            className="bg-[#1e2a36] px-6 border-l border-[#2c3a47] hover:bg-[#2c3a47] transition-colors disabled:opacity-50"
            onClick={() => betAmount && betAmount > 0 && setBetAmount(betAmount / 2)}
            disabled={isBetFormDisabled}
          >
            ½
          </button>
          <button
            className="bg-[#1e2a36] px-6 border-l border-[#2c3a47] hover:bg-[#2c3a47] transition-colors disabled:opacity-50"
            onClick={() => betAmount && betAmount > 0 && setBetAmount(betAmount * 2)}
            disabled={isBetFormDisabled}
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

      {/* Action Button */}
      {gameState === "WAITING" && !isBetPlaced && (
        <button
          onClick={isBetButtonDisabled ? handleDisabledBetClick : handleBetClick}
          disabled={isBetButtonDisabled}
          className="w-full bg-[#4cd964] hover:bg-[#3cc153] disabled:bg-[#2c3a47] disabled:text-gray-400 text-black font-medium py-4 rounded-md transition-colors"
        >
          Bet
        </button>
      )}

      {gameState === "WAITING" && isBetPlaced && (
        <button
          disabled
          className="w-full bg-orange-500 text-black font-medium py-4 rounded-md opacity-80"
        >
          Bet Placed... Waiting
        </button>
      )}

      {gameState === "PLAYING" && isBetPlaced && !hasCashedOut && (
        <button
          onClick={handleCashOutClick}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-medium py-4 rounded-md transition-colors"
        >
          Cash Out (${currentProfit})
        </button>
      )}

      {gameState === "PLAYING" && (!isBetPlaced || hasCashedOut) && (
        <button
          disabled
          className="w-full bg-[#2c3a47] text-gray-400 font-medium py-4 rounded-md"
        >
          {hasCashedOut ? "Cashed Out!" : "Game in Progress"}
        </button>
      )}

      {gameState === "CRASHED" && (
        <button
          disabled
          className="w-full bg-red-500 text-white font-medium py-4 rounded-md opacity-80"
        >
          Crashed
        </button>
      )}
    </div>
  );
}
