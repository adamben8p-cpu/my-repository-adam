"use client";

import React, { useEffect, useState, useRef } from "react";
import { useLimboStore } from "@/app/_store/limboStore";

export default function LimboComponent() {
  const { gameState, resultMultiplier, targetMultiplier, isWin } = useLimboStore();
  const [displayMulti, setDisplayMulti] = useState(1.00);
  
  const animationRef = useRef<number>();
  
  useEffect(() => {
    if (gameState === "IDLE") {
      setDisplayMulti(1.00);
    } else if (gameState === "ROLLING") {
      const start = performance.now();
      
      const spin = (time: number) => {
        const elapsed = time - start;
        // Generate a wild fake multiplier bouncing around
        // It should look incredibly fast
        const fakeMulti = 1.00 + Math.pow(Math.random() * 8, 3);
        setDisplayMulti(fakeMulti);
        
        // Keep animating as long as we're in rolling state
        if (useLimboStore.getState().gameState === "ROLLING") {
          animationRef.current = requestAnimationFrame(spin);
        }
      };
      animationRef.current = requestAnimationFrame(spin);
      
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      }
    } else if (gameState === "REVEALED") {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // Hard lock to the actual hidden result server determined
      setDisplayMulti(resultMultiplier);
    }
  }, [gameState, resultMultiplier]);

  let colorClass = "text-white";
  let wrapperClass = "bg-[#0f172a] shadow-[0_0_15px_rgba(255,255,255,0.05)]";
  
  if (gameState === "REVEALED") {
    if (isWin) {
      colorClass = "text-[#4cd964] scale-110";
      wrapperClass = "bg-[#0f172a] shadow-[0_0_25px_rgba(76,217,100,0.2)]"; 
    } else {
      colorClass = "text-gray-500 scale-95 opacity-80";
    }
  }

  // Handle valid target string
  const validTarget = targetMultiplier === null || isNaN(targetMultiplier) ? 1.01 : targetMultiplier;

  return (
    <div className={`w-full flex justify-center items-center rounded-lg aspect-[8/5] relative overflow-hidden transition-all duration-300 ${wrapperClass}`}>
      
      {/* Background Target Line */}
      {gameState !== "IDLE" && (
        <div className="absolute inset-x-0 w-full flex justify-center opacity-30 pointer-events-none transition-opacity duration-300">
           <div className="border-b-2 border-dashed border-gray-400 w-[80%] mx-10 relative mt-24">
             <div className="absolute right-0 bottom-1 text-lg text-gray-400 font-bold px-2">
               Target: {validTarget.toFixed(2)}x
             </div>
           </div>
        </div>
      )}

      {/* Main Multiplier Display */}
      <h1 
        className={`text-6xl sm:text-8xl md:text-[8rem] font-extrabold tracking-tighter transition-all drop-shadow-2xl ${
          gameState === "ROLLING" ? "duration-75" : "duration-500"
        } ${colorClass}`}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {displayMulti.toFixed(2)}
        <span className="text-4xl sm:text-6xl md:text-7xl ml-1 font-bold">x</span>
      </h1>
      
    </div>
  );
}
