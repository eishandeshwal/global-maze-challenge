import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Share2, Timer, Trophy, ZoomIn, ZoomOut, Box, Square } from "lucide-react";
import { generateMaze, getMazeNumber, getTodaySeed, generateShareText, solveMaze } from "@/utils/maze";
import MobileControls from "@/components/MobileControls";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import type { Position } from "@/utils/maze";

const MAZE_SIZE = 15; // This creates a challenging but solvable maze
const MAZE_RINGS = 6; // Number of rings in the circular maze
const ZOOM_VIEW_SIZE = 3; // Number of cells visible around the player (3 means 7x7 grid)

const Maze: React.FC = () => {
  const [maze, setMaze] = useState(generateMaze(MAZE_SIZE, getTodaySeed()));
  const [playerPos, setPlayerPos] = useState<Position>(maze.startPosition);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [time, setTime] = useState(0);
  const [zoomedView, setZoomedView] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [revealedCells, setRevealedCells] = useState<boolean[][]>(() => 
    Array(maze.grid.length).fill(null).map(() => Array(maze.grid[0].length).fill(false))
  );
  const timeRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();
  const gameStarted = useRef(false);
  const isMobile = useIsMobile();
  const mazeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!completed) handleMove(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerPos, completed]);

  useEffect(() => {
    if (!gameStarted.current && moves > 0) {
      gameStarted.current = true;
      startTimeRef.current = Date.now();
      timeRef.current = setInterval(() => {
        setTime(Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000));
      }, 1000);
      
      // Activate 3D mode after first move
      setIs3D(true);
    }

    return () => {
      if (timeRef.current) clearInterval(timeRef.current);
    };
  }, [moves]);

  useEffect(() => {
    if (moves > 0) {
      const newRevealedCells = [...revealedCells];
      
      for (let y = Math.max(0, playerPos.y - ZOOM_VIEW_SIZE); y <= Math.min(maze.grid.length - 1, playerPos.y + ZOOM_VIEW_SIZE); y++) {
        for (let x = Math.max(0, playerPos.x - ZOOM_VIEW_SIZE); x <= Math.min(maze.grid[0].length - 1, playerPos.x + ZOOM_VIEW_SIZE); x++) {
          newRevealedCells[y][x] = true;
        }
      }
      
      setRevealedCells(newRevealedCells);
    }
  }, [playerPos, moves]);

  const handleMove = useCallback((direction: string) => {
    const currentCell = maze.grid[playerPos.y][playerPos.x];
    let newPos = { ...playerPos };

    switch (direction) {
      case "ArrowUp":
      case "w":
        if (!currentCell.walls.top) newPos.y--;
        break;
      case "ArrowRight":
      case "d":
        if (!currentCell.walls.right) newPos.x++;
        break;
      case "ArrowDown":
      case "s":
        if (!currentCell.walls.bottom) newPos.y++;
        break;
      case "ArrowLeft":
      case "a":
        if (!currentCell.walls.left) newPos.x--;
        break;
      default:
        return;
    }

    if (
      newPos.x !== playerPos.x ||
      newPos.y !== playerPos.y
    ) {
      setPlayerPos(newPos);
      setMoves(m => m + 1);

      if (newPos.x === maze.endPosition.x && newPos.y === maze.endPosition.y) {
        handleWin();
      }
    }
  }, [playerPos, maze]);

  const handleWin = useCallback(() => {
    if (timeRef.current) clearInterval(timeRef.current);
    setCompleted(true);
    setShowStats(true);
    setZoomedView(false);
    setIs3D(false);
    toast("Congratulations! You've completed today's maze! 🎉");
  }, []);

  const handleShare = async () => {
    const shareText = generateShareText(moves, time, getMazeNumber());
    
    try {
      await navigator.clipboard.writeText(shareText);
      toast("Results copied to clipboard!");
    } catch (err) {
      toast("Couldn't copy to clipboard. Please try again.");
    }
  };

  const toggleZoomView = () => {
    setZoomedView(!zoomedView);
  };

  const toggle3DView = () => {
    setIs3D(!is3D);
  };

  const isCellVisible = (x: number, y: number) => {
    if (!zoomedView) return true;
    if (completed) return true;
    
    if ((x === maze.startPosition.x && y === maze.startPosition.y) || 
        (x === maze.endPosition.x && y === maze.endPosition.y)) {
      return true;
    }
    
    return revealedCells[y][x];
  };

  const getCircularPosition = (x: number, y: number) => {
    // Calculate the distance from the center of the grid
    const centerX = (MAZE_SIZE - 1) / 2;
    const centerY = (MAZE_SIZE - 1) / 2;

    // Calculate the normalized position (-1 to 1)
    const normalizedX = (x - centerX) / centerX;
    const normalizedY = (y - centerY) / centerY;

    // Calculate polar coordinates (radius and angle)
    const distanceFromCenter = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
    const maxDistance = Math.sqrt(2); // Maximum possible distance in a normalized grid

    // Calculate the ring (0 = center, 1 = outer)
    const ringIndex = Math.min(MAZE_RINGS - 1, Math.floor(distanceFromCenter * MAZE_RINGS / maxDistance));
    
    // Calculate ring radius (inner radius = 10%, each ring takes up equal space to the outer edge)
    const innerRadius = 10;
    const outerRadius = 45;
    const ringWidth = (outerRadius - innerRadius) / MAZE_RINGS;
    
    // Get the radius for this ring
    const radius = innerRadius + ringWidth * (ringIndex + 0.5);
    
    // Calculate angle (in radians)
    const angle = Math.atan2(normalizedY, normalizedX);
    
    // Convert back to cartesian coordinates (centered in the container)
    const containerCenterX = 50;
    const containerCenterY = 50;
    const posX = containerCenterX + radius * Math.cos(angle);
    const posY = containerCenterY + radius * Math.sin(angle);
    
    // Calculate the cell size based on the ring (outer rings have more cells, so should be smaller)
    // The outer ring cells should be about 40% the size of the inner ring cells
    const baseCellSize = 4;
    const cellScaleFactor = 1 - (ringIndex * 0.1);
    const cellSize = baseCellSize * cellScaleFactor;
    
    return { posX, posY, cellSize, ringIndex, angle };
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">DailyMaze</h1>
        <p className="text-muted-foreground">#{getMazeNumber()}</p>
      </div>

      <div className="glass-card p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            <span className="font-mono">{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, "0")}</span>
          </div>
          <div>Moves: {moves}</div>
          <div className="flex gap-2">
            {moves > 0 && !completed && (
              <Button variant="ghost" size="sm" onClick={toggleZoomView} title="Toggle zoom">
                {zoomedView ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              </Button>
            )}
            {moves > 0 && !completed && (
              <Button variant="ghost" size="sm" onClick={toggle3DView} title="Toggle 3D view">
                {is3D ? <Square className="w-4 h-4" /> : <Box className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>

        <div 
          className="maze-container"
          ref={mazeRef}
        >
          <div 
            className={`circular-maze ${is3D ? 'maze-3d' : ''}`}
            style={{
              perspective: '1000px',
              transformStyle: 'preserve-3d',
            }}
          >
            {maze.grid.map((row, y) =>
              row.map((cell, x) => {
                const { posX, posY, cellSize, ringIndex, angle } = getCircularPosition(x, y);
                
                // 3D transformation values
                const depth = is3D ? ringIndex * 10 : 0;
                const perspective = is3D ? 30 - (ringIndex * 5) : 0;
                const rotateX = is3D ? 60 : 0;
                
                // Skip rendering cells that are too close to the center (creates the center hole)
                if (ringIndex === 0 && distanceFromCenter(x, y) < 0.15) {
                  return null;
                }
                
                return (
                  <div
                    key={`${x}-${y}`}
                    className={`
                      maze-cell absolute
                      ${x === playerPos.x && y === playerPos.y ? "bg-maze-player" : ""}
                      ${x === maze.startPosition.x && y === maze.startPosition.y ? "bg-maze-start" : ""}
                      ${x === maze.endPosition.x && y === maze.endPosition.y ? "bg-maze-end" : ""}
                      ${!isCellVisible(x, y) ? "opacity-0" : ""}
                      ${zoomedView && Math.abs(x - playerPos.x) <= 1 && Math.abs(y - playerPos.y) <= 1 ? "scale-[1.15]" : ""}
                      ${zoomedView ? "transition-all duration-300" : ""}
                      ${is3D ? "maze-cell-3d" : ""}
                    `}
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                      width: `${cellSize}%`,
                      height: `${cellSize}%`,
                      transform: `translate(-50%, -50%) ${is3D ? `rotateX(${rotateX}deg) translateZ(${depth}px)` : ''}`,
                      transformOrigin: 'center',
                      transition: 'all 0.5s ease-out',
                      zIndex: is3D ? Math.floor(100 - ringIndex * 10) : 'auto',
                    }}
                  >
                    {cell.walls.top && (
                      <div 
                        className="wall wall-top absolute top-0 left-0 right-0 h-0.5 bg-black" 
                        style={{ 
                          transform: is3D ? `translateZ(2px)` : 'none',
                        }}
                      />
                    )}
                    {cell.walls.right && (
                      <div 
                        className="wall wall-right absolute top-0 bottom-0 right-0 w-0.5 bg-black" 
                        style={{ 
                          transform: is3D ? `translateZ(2px)` : 'none',
                        }}
                      />
                    )}
                    {cell.walls.bottom && (
                      <div 
                        className="wall wall-bottom absolute bottom-0 left-0 right-0 h-0.5 bg-black" 
                        style={{ 
                          transform: is3D ? `translateZ(2px)` : 'none',
                        }}
                      />
                    )}
                    {cell.walls.left && (
                      <div 
                        className="wall wall-left absolute top-0 bottom-0 left-0 w-0.5 bg-black" 
                        style={{ 
                          transform: is3D ? `translateZ(2px)` : 'none',
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {isMobile ? "Use the controls below to move" : "Use arrow keys or WASD to move"}
        </div>
      </div>

      {isMobile && !completed && <MobileControls onMove={handleMove} is3D={is3D} />}

      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>DailyMaze #{getMazeNumber()} Completed!</DialogTitle>
            <DialogDescription>
              You successfully navigated through the maze
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{moves}</div>
                <div className="text-sm text-muted-foreground">Moves</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, "0")}</div>
                <div className="text-sm text-muted-foreground">Time</div>
              </div>
            </div>
            <Button onClick={handleShare} className="w-full gap-2">
              <Share2 className="w-4 h-4" />
              Share Result
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper function to calculate distance from center
const distanceFromCenter = (x: number, y: number): number => {
  const centerX = (MAZE_SIZE - 1) / 2;
  const centerY = (MAZE_SIZE - 1) / 2;
  const normalizedX = (x - centerX) / centerX;
  const normalizedY = (y - centerY) / centerY;
  return Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
};

export default Maze;
