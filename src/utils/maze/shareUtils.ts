
import { formatTime, getMazeNumber } from "./dateUtils";

export const generateShareText = (moves: number, time: number, mazeNumber: number): string => {
  const timeStr = formatTime(time);
  return `DailyMaze #${mazeNumber}\n${moves} moves • ${timeStr}\n\n${"⬛".repeat(moves)}\n\nhttps://dailymaze.com`;
};
