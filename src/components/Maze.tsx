
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share2, Timer, Trophy } from "lucide-react";
import { generateMaze, getMazeNumber, getTodaySeed, generateShareText } from "@/utils/mazeUtils";
import { toast } from "sonner";

interface Position {
  x: number;
  y: number;
}

const MAZE_SIZE = 15; // This creates a challenging but solvable maze

const Maze: React.FC = () => {
  const [maze, setMaze] = useState(generateMaze(MAZE_SIZE, getTodaySeed()));
  const [playerPos, setPlayerPos] = useState<Position>(maze.startPosition);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [time, setTime] = useState(0);
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
    }

    return () => {
      if (timeRef.current) clearInterval(timeRef.current);
    };
  }, [moves]);

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

      // Check win condition
      if (newPos.x === maze.endPosition.x && newPos.y === maze.endPosition.y) {
        handleWin();
      }
    }
  }, [playerPos, maze]);

  const handleWin = useCallback(() => {
    if (timeRef.current) clearInterval(timeRef.current);
    setCompleted(true);
    setShowStats(true);
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
