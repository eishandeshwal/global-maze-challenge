
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Share2, Timer, Trophy, ZoomIn, ZoomOut } from "lucide-react";
import { generateMaze, getMazeNumber, getTodaySeed, generateShareText, solveMaze } from "@/utils/maze";
import { toast } from "sonner";
import type { Position } from "@/utils/maze";

const MAZE_SIZE = 15; // This creates a challenging but solvable maze
const ZOOM_VIEW_SIZE = 3; // Number of cells visible around the player (3 means 7x7 grid)

const Maze: React.FC = () => {
  const [maze, setMaze] = useState(generateMaze(MAZE_SIZE, getTodaySeed()));
  const [playerPos, setPlayerPos] = useState<Position>(maze.startPosition);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [time, setTime] = useState(0);
  const [zoomedView, setZoomedView] = useState(false);
  const [revealedCells, setRevealedCells] = useState<boolean[][]>(() => 
    Array(maze.grid.length).fill(null).map(() => Array(maze.grid[0].length).fill(false))
  );
  const timeRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();
  const gameStarted = useRef(false);

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
      
      // Switch to zoomed view after first move
      setZoomedView(true);
    }

    return () => {
      if (timeRef.current) clearInterval(timeRef.current);
    };
  }, [moves]);

  // Update revealed cells when player moves
  useEffect(() => {
    if (moves > 0) {
      // Create new revealed cells array
      const newRevealedCells = [...revealedCells];
      
      // Reveal cells around player position
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
    setZoomedView(false); // Show the full maze again after winning
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

  // Determine which cells are visible to the player
  const isCellVisible = (x: number, y: number) => {
    if (!zoomedView) return true; // Full maze view
    if (completed) return true; // Show all after completion
    
    // Always show start and end positions
    if ((x === maze.startPosition.x && y === maze.startPosition.y) || 
        (x === maze.endPosition.x && y === maze.endPosition.y)) {
      return true;
    }
    
    // Show cells that have been revealed
    return revealedCells[y][x];
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
          {moves > 0 && !completed && (
            <Button variant="ghost" size="sm" onClick={toggleZoomView}>
              {zoomedView ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </Button>
          )}
        </div>

        <div className="maze-container">
          <div
            className="maze-grid"
            style={{ "--maze-size": MAZE_SIZE } as React.CSSProperties}
          >
            {maze.grid.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`
                    maze-cell relative
                    ${cell.walls.top ? "border-t-2 border-black" : ""}
                    ${cell.walls.right ? "border-r-2 border-black" : ""}
                    ${cell.walls.bottom ? "border-b-2 border-black" : ""}
                    ${cell.walls.left ? "border-l-2 border-black" : ""}
                    ${x === playerPos.x && y === playerPos.y ? "bg-maze-player" : ""}
                    ${x === maze.startPosition.x && y === maze.startPosition.y ? "bg-maze-start" : ""}
                    ${x === maze.endPosition.x && y === maze.endPosition.y ? "bg-maze-end" : ""}
                    ${!isCellVisible(x, y) ? "opacity-0" : ""}
                    ${zoomedView && Math.abs(x - playerPos.x) <= 1 && Math.abs(y - playerPos.y) <= 1 ? "scale-[1.15]" : ""}
                    ${zoomedView ? "transition-all duration-300" : ""}
                  `}
                />
              ))
            )}
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Use arrow keys or WASD to move
        </div>
      </div>

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

export default Maze;
