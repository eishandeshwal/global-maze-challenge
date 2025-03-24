
import { formatTime, getMazeNumber } from "./dateUtils";

export const generateShareText = (moves: number, time: number, mazeNumber: number, penalties: number, bonuses: number): string => {
  const timeStr = formatTime(time);
  const totalScore = moves + penalties - bonuses;
  
  // Limit the number of squares to a reasonable amount (max 50)
  const squareCount = Math.min(totalScore, 50);
  const squares = "⬛".repeat(squareCount);
  
  return `DailyMaze #${mazeNumber}\n${totalScore} total (${moves} moves, +${penalties} mine penalties, -${bonuses} powerup bonuses) • ${timeStr}\n\n${squares}\n\nhttps://dailymaze.com`;
};
