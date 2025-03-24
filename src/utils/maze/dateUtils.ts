
// Seed random number generator for deterministic output
export const seedRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
};

// Get today's seed based on UTC time (reset at 12 AM UTC)
export const getTodaySeed = () => {
  const now = new Date();
  // Adjust date to UTC
  const utcNow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  // Format: YYYYMMDD as number
  return parseInt(
    `${utcNow.getUTCFullYear()}${String(utcNow.getUTCMonth() + 1).padStart(2, "0")}${String(
      utcNow.getUTCDate()
    ).padStart(2, "0")}`,
    10
  );
};

// Get maze number (days since start, starting from 1)
export const getMazeNumber = () => {
  // Start counting from 1 (day 1)
  return 1;
};

export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
