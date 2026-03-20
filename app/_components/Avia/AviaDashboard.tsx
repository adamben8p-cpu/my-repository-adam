"use client";
import React from "react";
import { useAviaStore } from "@/app/_store/aviaStore";
import { Plane, Navigation, TrendingUp } from "lucide-react";

export default function AviaDashboard() {
  const { currentMultiplier, altitude, distance } = useAviaStore();

  return (
    <div className="w-full bg-[#0f172a] border-t border-[#1e2a36] rounded-b-xl p-4 flex justify-between items-center shadow-inner relative z-10">
      <div className="flex items-center gap-2 flex-1 justify-center">
        <Plane className="text-gray-400" size={24} />
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Altitude</span>
          <span className="text-white font-mono text-xl">{altitude * 1000} ft</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center flex-1 border-x border-[#1e2a36]">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-[#4cd964]" size={24} />
          <span className="text-[#4cd964] font-extrabold text-3xl tabular-nums">{currentMultiplier.toFixed(2)}x</span>
        </div>
        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Multiplier</span>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-center">
        <Navigation className="text-blue-400" size={24} />
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Distance</span>
          <span className="text-white font-mono text-xl">{Math.floor(distance * 10)} km</span>
        </div>
      </div>
    </div>
  );
}
