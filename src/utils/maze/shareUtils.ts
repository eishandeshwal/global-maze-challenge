
import { formatTime, getMazeNumber } from "./dateUtils";

export const generateShareText = (moves: number, time: number, mazeNumber: number, penalties: number, bonuses: number): string => {
  const timeStr = formatTime(time);
  const totalScore = moves + penalties - bonuses;
  
  // Use colored emojis for visualization
  // 🔴 for mines (penalties)
  // 🟢 for powerups (bonuses)
  // ⬛ for regular moves
  
  // Calculate how many of each emoji to show (capped at 50 total)
  const maxEmojis = 50;
  const totalEmojis = Math.min(totalScore, maxEmojis);
  
  // Calculate proportions: if we have 10 penalties out of 100 total, we want 10% of our emojis to be red
  const mineEmojiCount = Math.round((penalties / (moves + penalties)) * totalEmojis);
  const powerupEmojiCount = Math.round((bonuses / (moves + penalties)) * totalEmojis);
  const moveEmojiCount = totalEmojis - mineEmojiCount - powerupEmojiCount;
  
  // Create the emoji string
  const mineEmojis = "🔴".repeat(mineEmojiCount);
  const powerupEmojis = "🟢".repeat(powerupEmojiCount);
  const moveEmojis = "⬛".repeat(moveEmojiCount);
  
  // Combine all emojis
  const emojis = mineEmojis + powerupEmojis + moveEmojis;
  
  return `DailyMaze #${mazeNumber}\n${totalScore} total (${moves} moves, +${penalties} mine penalties, -${bonuses} powerup bonuses) • ${timeStr}\n\n${emojis}\n\nhttps://dailymaze.com`;
};
