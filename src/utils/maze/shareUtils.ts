
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
  
  // Get the actual number of mines hit and powerups collected
  // Each mine adds 5 to penalties, so divide by 5 to get count
  const minesHit = penalties / 5;
  // Each powerup subtracts 5 from the score, so divide by 5 to get count
  const powerupsCollected = bonuses / 5;
  
  // Calculate how many emojis to show for each type
  const mineEmojiCount = Math.min(minesHit, maxEmojis);
  const powerupEmojiCount = Math.min(powerupsCollected, maxEmojis - mineEmojiCount);
  const moveEmojiCount = Math.max(0, totalEmojis - mineEmojiCount - powerupEmojiCount);
  
  // Create the emoji string
  const mineEmojis = "🔴".repeat(mineEmojiCount);
  const powerupEmojis = "🟢".repeat(powerupEmojiCount);
  const moveEmojis = "⬛".repeat(moveEmojiCount);
  
  // Combine all emojis
  const emojis = mineEmojis + powerupEmojis + moveEmojis;
  
  return `DailyMaze #${mazeNumber}\n${totalScore} total (${moves} moves, +${penalties} mine penalties, -${bonuses} powerup bonuses) • ${timeStr}\n\n${emojis}\n\nhttps://dailymaze.com`;
};
