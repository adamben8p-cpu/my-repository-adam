"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { usePlinkoStore } from "@/app/_store/plinkoStore";
import { useCommonStore } from "@/app/_store/commonStore";
import { addGameResult } from "@/app/_constants/data";

export default function PlikoGame() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { ballsToDrop, popBet } = usePlinkoStore();
  const gameStarted = true;
  const [boardDimensions, setBoardDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Multiplier values exactly as shown in the image
  const multipliers = [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76];

  // Update board dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Set the board width to container width, with a max of 700px
        const width = Math.min(containerWidth, 700);
        // Maintain aspect ratio close to original
        const height = Math.min(width * 1.14, 800);
        setBoardDimensions({ width, height });
      }
    };

    // Initial calculation
    updateDimensions();

    // Update on resize
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Initialize the physics engine
  useEffect(() => {
    if (
      !sceneRef.current ||
      boardDimensions.width === 0
    )
      return;

    // Create engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.5 },
    });
    engineRef.current = engine;

    // Create renderer - match the dark navy background
    const boardWidth = boardDimensions.width;
    const boardHeight = boardDimensions.height;
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: boardWidth,
        height: boardHeight,
        wireframes: false,
        background: "#0f172a", // Dark navy background like in the image
      },
    });
    renderRef.current = render;

    // Create walls and pegs
    const wallOptions = {
      isStatic: true,
      // render: { fillStyle: "#0f172a" },
      render: { fillStyle: "white" },
    };

    // Walls
    const leftWall = Matter.Bodies.rectangle(
      1,
      boardHeight / 2,
      20,
      boardHeight,
      wallOptions
    );
    const rightWall = Matter.Bodies.rectangle(
      boardWidth - 1,
      boardHeight / 2,
      20,
      boardHeight,
      wallOptions
    );
    const ground = Matter.Bodies.rectangle(
      boardWidth / 2,
      boardHeight - 10,
      boardWidth,
      20,
      wallOptions
    );

    // Slot dividers
    const slotWidth = boardWidth / multipliers.length;
    const slotDividers = [];

    for (let i = 0; i <= multipliers.length; i++) {
      const x = i * slotWidth;
      slotDividers.push(
        Matter.Bodies.rectangle(x, boardHeight - 10, 0, 80, wallOptions)
      );
    }

    // Create pegs in triangle formation - white pegs as in the image
    const pegOptions = {
      isStatic: true,
      render: { fillStyle: "#ffffff" }, // White pegs
      restitution: 0.5,
      friction: 0.1,
    };

    const pegs = [];
    const rows = 16; // Matches the image (12 rows)
    // Calculate responsive peg radius and spacing based on board width
    const pegRadius = Math.max(3, Math.min(5, boardWidth / 140));
    const pegSpacing = Math.max(20, Math.min(35, boardWidth / 20)); // Responsive spacing between pegs

    // Calculate the starting position for the first row (3 pegs)
    const startX = boardWidth / 2 - pegSpacing;
    const startY = boardHeight * 0.1; // Relative to board height

    for (let row = 0; row < rows; row++) {
      // Each row has (row + 3) pegs, starting with 3 pegs in the first row
      const pegsInRow = row + 3;

      // Calculate the starting X position for this row to center it
      const rowStartX = boardWidth / 2 - ((pegsInRow - 1) * pegSpacing) / 2;

      for (let col = 0; col < pegsInRow; col++) {
        const x = rowStartX + col * pegSpacing;
        const y = startY + row * pegSpacing;
        pegs.push(Matter.Bodies.circle(x, y, pegRadius, pegOptions));
      }
    }

    // Add all bodies to the world
    Matter.World.add(engine.world, [
      leftWall,
      rightWall,
      ground,
      ...slotDividers,
      ...pegs,
    ]);

    // Create runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    // Start the engine and renderer
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Handle ball landing in slots
    Matter.Events.on(engine, "collisionStart", (event) => {
      const pairs = event.pairs;

      pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Check if a ball has hit the ground
        if (
          (bodyA.label === "ball" && bodyB === ground) ||
          (bodyB.label === "ball" && bodyA === ground)
        ) {
          const ball = bodyA.label === "ball" ? bodyA : bodyB;

          // Calculate which slot the ball landed in
          const ballX = ball.position.x;
          const slotIndex = Math.min(
            Math.floor(ballX / slotWidth),
            multipliers.length - 1
          );
          const multiplier = multipliers[slotIndex];

          // Calculate profit based on the ball's bet amount and multiplier
          const betAmount = ball.plugin?.betAmount || 0;
          const profit = parseFloat((betAmount * multiplier).toFixed(2));

          if (profit > 0) {
            const currentBalance = useCommonStore.getState().balance || 0;
            const newBalance = currentBalance + profit;
            useCommonStore.getState().setBalance(newBalance);
            // Record game result
            addGameResult("Plinko", "Win", profit, newBalance);
          }

          // Remove the ball after a short delay
          setTimeout(() => {
            Matter.World.remove(engine.world, ball);
          }, 500);
        }
      });
    });

    // Cleanup function
    return () => {
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
        renderRef.current.canvas.remove();
        renderRef.current = null;
      }

      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
        runnerRef.current = null;
      }

      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false);
        Matter.Engine.clear(engineRef.current);
        engineRef.current = null;
      }
    };
  }, [gameStarted, boardDimensions]);

  // Drop a ball
  const dropBall = (betAmount: number) => {
    if (!engineRef.current) return;

    // Get the board width from the renderer
    const boardWidth = boardDimensions.width;

    const ball = Matter.Bodies.circle(
      boardWidth / 2 + (Math.random() * 40 - 20), // Random x position near the center
      boardDimensions.height * 0.06, // y position at the top (responsive)
      Math.max(4, Math.min(6, boardWidth / 120)), // responsive radius
      {
        restitution: 0.8,
        friction: 0.005,
        density: 0.001,
        label: "ball",
        plugin: { betAmount },
        render: { fillStyle: "#f9d276" }, // Gold ball
      }
    );

    Matter.World.add(engineRef.current.world, ball);
  };

  // Listen for ball drops from the store
  const prevBallsToDrop = useRef(0);
  useEffect(() => {
    if (ballsToDrop > prevBallsToDrop.current) {
      const difference = ballsToDrop - prevBallsToDrop.current;
      prevBallsToDrop.current = ballsToDrop;

      for (let i = 0; i < difference; i++) {
        const bet = popBet();
        if (bet !== undefined) {
          dropBall(bet);
        }
      }
    }
  }, [ballsToDrop, popBet]);

  // Function to get background color for multiplier slots
  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 10) return "bg-red-500"; // High values are red
    if (multiplier >= 3) return "bg-orange-500"; // Medium-high values are orange
    if (multiplier >= 0.9) return "bg-orange-400"; // Medium values are light orange
    if (multiplier >= 0.3) return "bg-yellow-500"; // Low-medium values are yellow
    return "bg-yellow-400"; // Lowest values are light yellow
  };

  return (
    <div className="flex flex-col items-center w-full" ref={containerRef}>
      <div
        ref={sceneRef}
        className="w-full max-w-full sm:max-w-[90%] md:max-w-[700px] bg-slate-900 relative mb-4 overflow-hidden rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.05)]"
        style={{ height: `${boardDimensions.height}px` }}
      >
        {/* Multiplier slots display */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around z-10 text-white font-bold">
          {multipliers.map((value, index) => (
            <div
              key={index}
              className={`flex items-center justify-center h-8 sm:h-10 md:h-12 text-xs sm:text-sm md:text-base ${getMultiplierColor(
                value
              )}`}
              style={{
                width: `${100 / multipliers.length}%`,
                minWidth: "20px",
              }}
            >
              {value}x
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
