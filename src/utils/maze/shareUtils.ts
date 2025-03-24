
import { formatTime, getMazeNumber } from "./dateUtils";

export const generateShareText = (moves: number, time: number, mazeNumber: number, penalties: number, bonuses: number): string => {
  const timeStr = formatTime(time);
  const totalScore = moves + penalties - bonuses;
  return `DailyMaze #${mazeNumber}\n${totalScore} total (${moves} moves, +${penalties} mine penalties, -${bonuses} powerup bonuses) • ${timeStr}\n\n${"⬛".repeat(totalScore)}\n\nhttps://dailymaze.com`;
};
