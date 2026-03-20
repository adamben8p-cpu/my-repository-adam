"use client";
import React, { type ChangeEvent } from "react";
import { usePlinkoStore } from "@/app/_store/plinkoStore";
import { useCommonStore } from "@/app/_store/commonStore";
import { Coins } from "lucide-react";

export default function PlinkoConfig() {
  const { betAmount, setBetAmount, incrementBallsToDrop, addBet } = usePlinkoStore();
  const balance = useCommonStore((state) => state.balance);
  const setBalance = useCommonStore((state) => state.setBalance);

  const handleBetAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const amount = value === "" ? null : Number(value);
    setBetAmount(amount);
  };

  const handleBet = () => {
    if (betAmount === null || betAmount <= 0) {
      return;
    }
    
    // Fallback if balance is missing, though we ensure it's a number
    const currentBalance = balance ?? 0;
    
    if (betAmount > currentBalance) {
      alert("Invalid bet or insufficient balance");
      return;
    }

    // Deduct bet from balance
    setBalance(currentBalance - betAmount);

    // Add bet to queue and trigger drop
    addBet(betAmount);
    incrementBallsToDrop();
  };

  const handleDisabledBetClick = () => {
    const currentBalance = balance ?? 0;
    if (betAmount !== null && betAmount > currentBalance) {
      alert("You don't have enough balance");
    }
  };

  const isBetDisabled = betAmount === null || betAmount <= 0 || (balance !== undefined && betAmount > balance);

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
              className="w-full bg-[#1e2a36] px-3 py-3 outline-none"
              onClick={(e) => e.currentTarget.select()}
            />
            <div className="absolute right-3 pointer-events-none">
              <Coins className="w-4 h-4 text-success" />
            </div>
          </div>
          <button
            className="bg-[#1e2a36] px-6 border-l border-[#2c3a47] hover:bg-[#2c3a47] transition-colors"
            onClick={() => betAmount && betAmount > 0 && setBetAmount(betAmount / 2)}
          >
            ½
          </button>
          <button
            className="bg-[#1e2a36] px-6 border-l border-[#2c3a47] hover:bg-[#2c3a47] transition-colors"
            onClick={() => betAmount && betAmount > 0 && setBetAmount(betAmount * 2)}
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

      {/* Bet Button */}
      <button
        onClick={isBetDisabled ? handleDisabledBetClick : handleBet}
        disabled={isBetDisabled}
        className="w-full bg-[#4cd964] hover:bg-[#3cc153] disabled:bg-[#2c3a47] disabled:text-gray-400 text-black font-medium py-4 rounded-md transition-colors"
      >
        Bet
      </button>
    </div>
  );
}
