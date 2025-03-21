
// Seed random number generator for deterministic output
export const seedRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
};

// Get today's seed
export const getTodaySeed = () => {
  const now = new Date();
  // Format: YYYYMMDD as number
  return parseInt(
    `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}`,
    10
  );
};

// Get maze number (days since start)
export const getMazeNumber = () => {
  const startDate = new Date(2023, 0, 1); // January 1, 2023
  const today = new Date();
  const timeDiff = today.getTime() - startDate.getTime();
  return Math.floor(timeDiff / (24 * 60 * 60 * 1000)) + 1;
};

export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
