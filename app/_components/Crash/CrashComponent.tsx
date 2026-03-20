"use client";

import React, { useEffect, useRef } from "react";
import { useCrashStore } from "@/app/_store/crashStore";
import { addGameResult } from "@/app/_constants/data";

const generateCrashPoint = () => {
  const r = Math.random();
  if (r < 0.03) return 1.00; // 3% chance to crash immediately
  return parseFloat(Math.max(1.00, 0.97 / (1 - r)).toFixed(2));
};

export default function CrashComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    gameState, setGameState,
    currentMultiplier, setCurrentMultiplier,
    crashPoint, setCrashPoint,
    countdown, setCountdown,
    isBetPlaced, setIsBetPlaced,
    hasCashedOut, profit
  } = useCrashStore();

  const animationRef = useRef<number>();
  const startTimestampRef = useRef<number>(0);

  // MAIN GAME LOOP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (gameState === "WAITING") {
      let waitTime = 5;
      setCountdown(waitTime);
      
      interval = setInterval(() => {
        waitTime -= 0.1;
        if (waitTime <= 0) {
          clearInterval(interval);
          setCrashPoint(generateCrashPoint());
          setCurrentMultiplier(1.00);
          setGameState("PLAYING");
        } else {
          setCountdown(waitTime);
        }
      }, 100);
      
      return () => clearInterval(interval);
    } 
    
    if (gameState === "PLAYING") {
      startTimestampRef.current = performance.now();
      
      const animate = (timestamp: number) => {
        if (!startTimestampRef.current) startTimestampRef.current = timestamp;
        
        const timeElapsedMs = timestamp - startTimestampRef.current;
        const timeS = timeElapsedMs / 1000;
        
        // Growth formula: slow at first, then faster. e^(0.07 * time)
        const nextMultiplier = Math.pow(Math.E, 0.06 * timeS);
        
        if (nextMultiplier >= crashPoint) {
          setCurrentMultiplier(crashPoint);
          setGameState("CRASHED");
          return; // Stop animation
        } else {
          setCurrentMultiplier(nextMultiplier);
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
    
    if (gameState === "CRASHED") {
      // Record game result if user bet
      if (isBetPlaced) {
        if (hasCashedOut) {
          addGameResult("Crash", "Win", profit, 0); // balance config handles additions.
        } else {
          addGameResult("Crash", "Loss", 0, 0);
        }
      }
      
      timeout = setTimeout(() => {
        setIsBetPlaced(false);
        setGameState("WAITING");
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [gameState, crashPoint, isBetPlaced, hasCashedOut, profit, setGameState, setCurrentMultiplier, setCrashPoint, setCountdown, setIsBetPlaced]);

  // CANVAS DRAWING LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 500;
    const { width, height } = canvas;

    let drawingAnimationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // We read live from Zustand to avoid massive React re-renders which destroys performance
      const state = useCrashStore.getState().gameState;
      const currentMulti = Math.max(1, useCrashStore.getState().currentMultiplier);
      const count = useCrashStore.getState().countdown;

      // Draw Grid / Borders
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Y axis
      ctx.moveTo(50, 20);
      ctx.lineTo(50, height - 40);
      // X axis
      ctx.lineTo(width - 20, height - 40);
      ctx.stroke();

      // Dynamic domains
      const maxY = Math.max(2.0, currentMulti * 1.2); 
      // X domain correlates with time
      const currentTimeS = Math.max(0, Math.log(currentMulti) / 0.06);
      const maxX = Math.max(10, currentTimeS * 1.2);

      // Helper function to map data to canvas coords
      const mapPoint = (t: number, m: number) => {
        const x = 50 + (t / maxX) * (width - 70);
        const y = (height - 40) - ((m - 1) / (maxY - 1)) * (height - 60);
        return { x, y };
      };

      // Draw curve
      ctx.beginPath();
      ctx.strokeStyle = state === "CRASHED" ? "#ef4444" : "#eab308";
      ctx.lineWidth = 4;
      
      let lastPoint = mapPoint(0, 1);
      ctx.moveTo(lastPoint.x, lastPoint.y);
      
      // Draw path up to current time
      const segments = 50;
      for (let i = 1; i <= segments; i++) {
        const t = (currentTimeS * i) / segments;
        const m = Math.pow(Math.E, 0.06 * t);
        const point = mapPoint(t, m);
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();

      // Fill area under curve
      ctx.lineTo(mapPoint(currentTimeS, 1).x, height - 40);
      ctx.lineTo(50, height - 40);
      ctx.fillStyle = state === "CRASHED" ? "rgba(239, 68, 68, 0.1)" : "rgba(234, 179, 8, 0.1)";
      ctx.fill();

      // Draw Rocket/Dot
      const tip = mapPoint(currentTimeS, currentMulti);
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = state === "CRASHED" ? "#ef4444" : "#eab308";
      ctx.fill();
      ctx.shadowColor = state === "CRASHED" ? "#ef4444" : "#eab308";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Text Overlay
      ctx.fillStyle = state === "CRASHED" ? "#ef4444" : "#ffffff";
      ctx.textAlign = "center";
      
      if (state === "WAITING") {
        ctx.font = "bold 48px sans-serif";
        ctx.fillText("Preparing...", width / 2, height / 2 - 20);
        ctx.font = "24px sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(`Starting in ${Math.max(0, count).toFixed(1)}s`, width / 2, height / 2 + 30);
      } else {
        ctx.font = "bold 64px sans-serif";
        ctx.fillText(`${currentMulti.toFixed(2)}x`, width / 2, height / 2);
        
        if (state === "CRASHED") {
          ctx.font = "24px sans-serif";
          ctx.fillText("Crashed", width / 2, height / 2 + 50);
        }
      }

      drawingAnimationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(drawingAnimationId);
    };
  }, []); // Run once and read mutable global state

  return (
    <div className="w-full flex justify-center">
      <canvas
        ref={canvasRef}
        className="w-full max-w-[800px] aspect-[8/5] bg-[#0f172a] rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.05)]"
      />
    </div>
  );
}
