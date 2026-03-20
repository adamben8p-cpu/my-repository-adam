"use client";
import React, { type ChangeEvent } from "react";
import { useLimboStore } from "@/app/_store/limboStore";
import { useCommonStore } from "@/app/_store/commonStore";
import { addGameResult } from "@/app/_constants/data";
import { Coins } from "lucide-react";

export default function LimboConfig() {
  const { 
    betAmount, setBetAmount, 
    targetMultiplier, setTargetMultiplier,
    gameState, triggerRoll
  } = useLimboStore();
  
  const balance = useCommonStore((state) => state.balance);
  const setBalance = useCommonStore((state) => state.setBalance);

  const handleBetAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const amount = value === "" ? null : Number(value);
    setBetAmount(amount);
  };

  const handleTargetChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    setTargetMultiplier(val);
  };

  // Win chance logic based on Target Multiplier. House edge is normally 1%.
  const validTarget = targetMultiplier && targetMultiplier >= 1.01 && !isNaN(targetMultiplier) ? targetMultiplier : 1.01;
  const winChance = Math.min(99, Math.max(0.01, 99 / validTarget));
  
  const potentialProfit = betAmount ? parseFloat((betAmount * targetMultiplier).toFixed(2)) : 0;

  const handleBetClick = () => {
    if (gameState === "ROLLING") return;
    const amount = typeof betAmount === 'number' ? betAmount : 0;
    const bal = balance ?? 0;
    
    if (amount <= 0 || amount > bal) {
      alert("Invalid bet or insufficient balance");
      return;
    }
    
    if (targetMultiplier < 1.01 || isNaN(targetMultiplier)) {
      alert("Minimum multiplier is 1.01x");
      return;
    }

    // Deduct bet from balance immediately
    setBalance(bal - amount);

    // Generate crash-like outcome curve
    const r = Math.random();
    // 1% instant crash
    let result = 1.00;
    if (r >= 0.01) {
      result = parseFloat(Math.max(1.01, 0.99 / (1 - r)).toFixed(2));
    }
    
    const isWin = result >= targetMultiplier;
    const profit = isWin ? potentialProfit : 0;
    
    triggerRoll(result, isWin, profit);
    
    // We update the profit inside the main balance ONLY when the animation hits REVEALED
    // To ensure consistency across environments without mounting issues we embed the delay identically to the store
    setTimeout(() => {
      if (isWin) {
         const newBal = useCommonStore.getState().balance + profit;
         useCommonStore.getState().setBalance(newBal);
         addGameResult("Limbo", "Win", profit, newBal);
      } else {
         addGameResult("Limbo", "Loss", 0, useCommonStore.getState().balance);
      }
    }, 500);
  };

  const isFormDisabled = gameState === "ROLLING";
  const isBetButtonDisabled = isFormDisabled || betAmount === null || betAmount <= 0 || (balance !== undefined && betAmount > balance) || targetMultiplier < 1.01 || isNaN(targetMultiplier);

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
              value={betAmount !== null ? betAmount : ""}
              min={1}
              onChange={handleBetAmountChange}
              disabled={isFormDisabled}
              className="w-full bg-[#1e2a36] px-3 py-3 outline-none disabled:opacity-50"
              onClick={(e) => !isFormDisabled && e.currentTarget.select()}
            />
            <div className="absolute right-3 pointer-events-none">
              <Coins className="w-4 h-4 text-success" />
            </div>
          </div>
          <button
            className="bg-[#1e2a36] px-6 border-l border-[#2c3a47] hover:bg-[#2c3a47] transition-colors disabled:opacity-50"
            onClick={() => betAmount && betAmount > 0 && setBetAmount(betAmount / 2)}
            disabled={isFormDisabled}
          >
            ½
          </button>
          <button
            className="bg-[#1e2a36] px-6 border-l border-[#2c3a47] hover:bg-[#2c3a47] transition-colors disabled:opacity-50"
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

      {/* Target Multiplier */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-[#b0b9d2]">Target Multiplier</span>
        </div>
        <div className="flex bg-[#1e2a36] rounded-md overflow-hidden">
          <input
            type="number"
            value={targetMultiplier !== null && !isNaN(targetMultiplier) ? targetMultiplier : ""}
            onChange={handleTargetChange}
            min={1.01}
            step={0.01}
            disabled={isFormDisabled}
            className="w-full bg-[#1e2a36] px-3 py-3 outline-none disabled:opacity-50"
            onClick={(e) => !isFormDisabled && e.currentTarget.select()}
          />
          <div className="bg-[#2c3a47] px-4 flex items-center text-gray-300 font-bold">
            x
          </div>
        </div>
      </div>

      {/* Win Chance */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-[#b0b9d2]">Win Chance</span>
        </div>
        <div className="flex bg-[#1e2a36] rounded-md overflow-hidden">
          <input
            type="text"
            value={winChance.toFixed(4)}
            readOnly
            className="w-full bg-[#2c3a47]/50 text-gray-400 px-3 py-3 outline-none cursor-not-allowed"
          />
          <div className="bg-[#2c3a47]/50 px-4 flex items-center text-gray-500 font-bold">
            %
          </div>
        </div>
      </div>

      {/* Profit on Win */}
      <div className="flex justify-between py-2 border-t border-[#1e2a36]">
        <span className="text-[#b0b9d2]">Profit on Win</span>
        <span className="text-success font-bold">${potentialProfit.toFixed(2)}</span>
      </div>

      {/* Action Button */}
      <button
        onClick={handleBetClick}
        disabled={isBetButtonDisabled}
        className="w-full bg-[#4cd964] hover:bg-[#3cc153] disabled:bg-[#2c3a47] disabled:text-gray-400 text-black font-medium py-4 rounded-md transition-colors"
      >
        {gameState === "ROLLING" ? "Rolling..." : "Bet"}
      </button>
    </div>
  );
}
