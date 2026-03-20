"use client";

import React, { useEffect, useRef } from "react";
import { useAviaStore } from "@/app/_store/aviaStore";
import { useCommonStore } from "@/app/_store/commonStore";
import { addGameResult } from "@/app/_constants/data";

export default function AviaComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Virtual sizing
    canvas.width = 1000;
    canvas.height = 500;
    const { width, height } = canvas;
    
    let animationId: number;
    let lastTime = performance.now();
    let localDistance = 0; 
    let planeY = height / 2;
    let textPopups: { x: number, y: number, text: string, type: string, life: number }[] = [];
    let prevGameState = useAviaStore.getState().gameState;

    const drawPlane = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      // Fuselage
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(0, 0, 35, 12, 0, 0, Math.PI * 2); 
      ctx.fill();
      
      // Cockpit Window
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.ellipse(20, -3, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Top Wing
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.moveTo(-10, 0); 
      ctx.lineTo(-25, -25); 
      ctx.lineTo(5, -25); 
      ctx.lineTo(15, 0); 
      ctx.fill(); 

      // Bottom Wing
      ctx.fillStyle = "#f1f5f9";
      ctx.beginPath();
      ctx.moveTo(-10, 0); 
      ctx.lineTo(-25, 25); 
      ctx.lineTo(5, 25); 
      ctx.lineTo(15, 0); 
      ctx.fill(); 

      // Tail
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(-25, -5);
      ctx.lineTo(-40, -20);
      ctx.lineTo(-35, 0);
      ctx.fill(); 
      
      ctx.restore();
    };

    const drawCloud = (cx: number, cy: number, scale: number, opacity: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.arc(25, -15, 35, 0, Math.PI * 2);
      ctx.arc(50, 0, 30, 0, Math.PI * 2);
      ctx.arc(25, 10, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const clouds = Array.from({ length: 15 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height - 150),
      scale: 0.5 + Math.random() * 0.8,
      speed: 0.2 + Math.random() * 0.5,
      opacity: 0.4 + Math.random() * 0.4
    }));

    const render = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
      lastTime = time;

      const state = useAviaStore.getState();
      
      // Reset variables on new flight
      if (state.gameState === "FLYING" && prevGameState !== "FLYING") {
        localDistance = 0;
        planeY = height / 2;
        textPopups = [];
      }
      prevGameState = state.gameState;

      const speedMultiplier = state.speed; 
      
      const advanceRate = state.gameState === "FLYING" ? 1.0 * speedMultiplier * dt : 0;

      // Draw Sky
      ctx.clearRect(0, 0, width, height);
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#0ea5e9");
      grad.addColorStop(1, "#bae6fd"); 
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw scrolling background clouds
      clouds.forEach(c => {
        if (state.gameState === "FLYING") {
           c.x -= c.speed * speedMultiplier * 100 * dt;
        }
        if (c.x < -100) c.x = width + 100;
        drawCloud(c.x, c.y, c.scale, c.opacity);
      });

      // Draw Sea
      const waterY = height - 80;
      const waterGrad = ctx.createLinearGradient(0, waterY, 0, height);
      waterGrad.addColorStop(0, "#0284c7");
      waterGrad.addColorStop(1, "#172554");
      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.moveTo(0, waterY);
      
      const waveOffset = (time * 0.003) % (Math.PI * 2);
      for(let x=0; x<=width; x+=20) {
        ctx.lineTo(x, waterY + Math.sin((x * 0.015) + waveOffset) * 12);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fill();

      // Plane logic
      let targetY = height / 2;
      let planeAngle = 0;
      
      if (state.gameState === "FLYING") {
        const prevDistance = Math.floor(localDistance);
        localDistance += advanceRate;
        const currentDistance = Math.floor(localDistance);

        // Altitude 0 = water (height-80), Altitude 6 = sky (80)
        targetY = (height - 80) - (state.altitude / 6) * (height - 160);

        // Plane approaches targetY
        planeY += (targetY - planeY) * 6 * dt * speedMultiplier;

        // Plane pitches towards direction
        const velY = (targetY - planeY);
        planeAngle = velY * 0.015;

        // Hitting Waypoints
        if (currentDistance > prevDistance && currentDistance <= state.flightPath.length) {
          const obs = state.flightPath[currentDistance - 1]; 
          
          if (obs) {
             let sign = "+";
             let type = "good";
             if (obs.type === "rocket") { sign = "/"; type = "bad"; }
             else if (obs.type === "mult") sign = "x";
             
             textPopups.push({
               x: 280, 
               y: planeY - 40,
               text: `${sign}${obs.value}`,
               type,
               life: 1.0
             });

             // Apply consequence
             if (obs.type === "rocket") {
               state.setAltitude(Math.max(0, state.altitude - 1));
               state.setCurrentMultiplier(parseFloat((state.currentMultiplier / 2).toFixed(2)));
             } else if (obs.type === "add") {
               state.setAltitude(Math.min(6, state.altitude + 1));
               state.setCurrentMultiplier(state.currentMultiplier + obs.value);
             } else if (obs.type === "mult") {
               state.setAltitude(Math.min(6, state.altitude + 1));
               state.setCurrentMultiplier(parseFloat((state.currentMultiplier * obs.value).toFixed(2)));
             }
             state.setDistance(currentDistance);
          }
        }
        
        // Render Waypoints
        state.flightPath.forEach((obs, index) => {
          const wDist = index + 1;
          const diff = wDist - localDistance;
          // Render only nearby waypoints
          if (diff > -0.5 && diff < 5) {
             const obsX = 300 + (diff * 180);
             // Waypoint height mirrors altitude it will send plane to loosely
             const obsY = (height - 80) - ((state.altitude) / 6) * (height - 160); 
             
             if (obs.type === "rocket") {
               // Draw Rocket
               ctx.fillStyle = "#ef4444";
               ctx.beginPath();
               ctx.ellipse(obsX, obsY, 15, 6, 0, 0, Math.PI * 2);
               ctx.fill();
               ctx.font = "bold 16px Arial";
               ctx.fillStyle = "white";
               ctx.fillText("/2", obsX, obsY - 15);
             } else {
               // Draw Multiplier Orb
               ctx.fillStyle = "#4cd964";
               ctx.beginPath();
               ctx.arc(obsX, obsY, 16, 0, Math.PI * 2);
               ctx.fill();
               ctx.fillStyle = "white";
               ctx.font = "bold 14px Arial";
               let symbol = obs.type === "mult" ? "x" : "+";
               ctx.fillText(`${symbol}${obs.value}`, obsX, obsY + 5);
             }
          }
        });

        // Resolve End Of Flight
        if (localDistance >= state.flightPath.length) {
          if (state.targetLanded) {
            const finalProfit = parseFloat((state.betAmount! * state.currentMultiplier).toFixed(2));
            state.endFlight(true, finalProfit);
            
            const bal = useCommonStore.getState().balance;
            useCommonStore.getState().setBalance(bal + finalProfit);
            addGameResult("AviaMasters", "Win", finalProfit, bal + finalProfit);
          } else {
             state.endFlight(false, 0);
             addGameResult("AviaMasters", "Loss", 0, useCommonStore.getState().balance);
          }
        }
      }

      // Handle Crashed/Landed States
      if (state.gameState === "GAMEOVER") {
         if (!state.isWin) {
            planeY += (waterY + 20 - planeY) * 5 * dt; 
            planeAngle = Math.PI / 4; // pitched down into water
         } else {
            planeY += (height / 2 - planeY) * 5 * dt; 
            planeAngle = 0;
         }
      }

      // Render Plane
      if (state.gameState !== "GAMEOVER" || state.isWin) {
         drawPlane(300, planeY, planeAngle);
      } else {
         ctx.save();
         ctx.globalAlpha = 0.5;
         drawPlane(300, planeY, planeAngle);
         ctx.restore();
         // Splash/Explosion
         ctx.font = "48px Arial";
         ctx.fillText("💥", 300, planeY);
      }

      // Render Popups (Damage/Buff Text)
      textPopups.forEach(p => {
         if (p.life > 0) {
            ctx.fillStyle = p.type === "good" ? `rgba(76, 217, 100, ${p.life})` : `rgba(239, 68, 68, ${p.life})`;
            ctx.font = "bold 32px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(p.text, p.x, p.y);
            p.y -= 40 * dt;
            p.life -= 1.0 * dt;
         }
      });
      textPopups = textPopups.filter(p => p.life > 0);

      // GAME OVER Overlay
      if (state.gameState === "GAMEOVER") {
         ctx.fillStyle = "rgba(0,0,0,0.6)";
         ctx.fillRect(0,0,width,height);
         ctx.textAlign = "center";
         
         if (state.isWin) {
            ctx.fillStyle = "#4cd964";
            ctx.font = "bold 60px sans-serif";
            ctx.fillText(`Safely Landed!`, width/2, height/2 - 20);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 32px sans-serif";
            ctx.fillText(`+ $${state.profit.toFixed(2)}`, width/2, height/2 + 30);
         } else {
            ctx.fillStyle = "#ef4444";
            ctx.font = "bold 60px sans-serif";
            ctx.fillText(`Crashed in Sea!`, width/2, height/2 - 20);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 32px sans-serif";
            ctx.fillText(`Better luck next time.`, width/2, height/2 + 30);
         }
      } else if (state.gameState === "IDLE") {
         // Start Screen Prompt
         ctx.fillStyle = "rgba(0,0,0,0.4)";
         ctx.fillRect(0,0,width,height);
         ctx.fillStyle = "#ffffff";
         ctx.textAlign = "center";
         ctx.font = "bold 40px sans-serif";
         ctx.fillText(`Awaiting Clearance...`, width/2, height/2);
         ctx.font = "bold 20px sans-serif";
         ctx.fillStyle = "#94a3b8";
         ctx.fillText(`Place a bet to take off`, width/2, height/2 + 40);
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="w-full flex justify-center items-center rounded-t-xl overflow-hidden bg-[#0f172a] shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-[#1e2a36] border-b-0">
        <canvas
          ref={canvasRef}
          className="w-full max-w-[1000px] aspect-[10/5]"
          style={{ display: "block" }}
        />
      </div>
    </div>
  );
}
