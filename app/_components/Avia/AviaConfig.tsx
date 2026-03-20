"use client";
import React from "react";
import { useAviaStore, Obstacle } from "@/app/_store/aviaStore";
import { useCommonStore } from "@/app/_store/commonStore";
import { Coins, Snail, User, Rabbit, Zap } from "lucide-react";

export default function AviaConfig() {
  const { 
    betAmount, setBetAmount, 
    speed, setSpeed,
    gameState, triggerFlight
  } = useAviaStore();
  
  const balance = useCommonStore((state) => state.balance);
  const setBalance = useCommonStore((state) => state.setBalance);

  const generateFlightPath = (): { path: Obstacle[], landed: boolean } => {
    const path: Obstacle[] = [];
    const length = Math.floor(Math.random() * 15) + 6; // random waypoint sequence length
    
    let simMulti = 1;
    let simAlt = 3;
    
    for (let i = 0; i < length; i++) {
      const r = Math.random();
      // Emulating 97% RTP balance. Roughly 30% rockets to risk altitude crashes.
      if (r < 0.30) {
        path.push({ type: "rocket", value: 2 });
        simAlt -= 1;
        simMulti = parseFloat((simMulti / 2).toFixed(2));
      } else if (r < 0.8) {
        // Additions
        const adds = [1, 2, 5];
        const val = adds[Math.floor(Math.random() * adds.length)];
        path.push({ type: "add", value: val });
        simAlt += 1;
        simMulti += val;
      } else {
        // Multiplications
        const mults = [2, 3];
        const val = mults[Math.floor(Math.random() * mults.length)];
        path.push({ type: "mult", value: val });
        simAlt += 1;
        simMulti *= val;
      }
      
      // Cap max altitude visually at 6
      if (simAlt > 6) simAlt = 6;
      
      if (simAlt <= 0) {
        return { path, landed: false }; 
      }
      // Stake typically locks wins if you scale high realistically
      if (simMulti >= 250) {
         return { path, landed: true };
      }
    }
    return { path, landed: true };
  }

  const handleBetClick = () => {
    if (gameState === "FLYING") return;
    const amount = typeof betAmount === 'number' ? betAmount : 0;
    const bal = balance ?? 0;
    
    if (amount <= 0 || amount > bal) {
      alert("Invalid bet or insufficient balance");
      return;
    }

    setBalance(bal - amount);
    const { path, landed } = generateFlightPath();
    triggerFlight(path, landed);
  };

  const isFormDisabled = gameState === "FLYING";
  const isBetButtonDisabled = isFormDisabled || betAmount === null || betAmount <= 0 || (balance !== undefined && betAmount > balance);

  const SpeedIcon = ({ level, icon: Icon, label }: { level: number, icon: any, label: string }) => (
    <button
      disabled={isFormDisabled}
      onClick={() => setSpeed(level)}
      className={`flex-1 flex justify-center py-4 transition-colors border-r border-[#1e2a36] last:border-0 ${
        speed === level ? "bg-[#334155] text-white" : "text-gray-500 hover:text-white hover:bg-[#1e2a36]"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={label}
    >
      <Icon size={20} />
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
              onChange={(e) => setBetAmount(e.target.value === "" ? null : Number(e.target.value))}
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

      {/* Speed Controls */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-[#b0b9d2]">Animation Speed</span>
        </div>
        <div className="flex bg-[#0f172a] rounded-md overflow-hidden border border-[#1e2a36]">
          <SpeedIcon level={1} icon={Snail} label="Tortoise" />
          <SpeedIcon level={2} icon={User} label="Person" />
          <SpeedIcon level={3} icon={Rabbit} label="Rabbit" />
          <SpeedIcon level={4} icon={Zap} label="Lightning" />
        </div>
      </div>

      {/* Action Button */}
      {gameState === "FLYING" ? (
        <button
          disabled
          className="w-full bg-orange-500 text-black font-medium py-4 rounded-md opacity-80"
        >
          Flying...
        </button>
      ) : (
        <button
          onClick={handleBetClick}
          disabled={isBetButtonDisabled}
          className="w-full bg-[#4cd964] hover:bg-[#3cc153] disabled:bg-[#2c3a47] disabled:text-gray-400 text-black font-extrabold text-lg py-4 rounded-md transition-colors shadow-lg"
        >
          Bet
        </button>
      )}
    </div>
  );
}
