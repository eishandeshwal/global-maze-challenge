
interface Cell {
  x: number;
  y: number;
  visited: boolean;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
}

interface MazeData {
  grid: Cell[][];
  size: number;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
}

// Seed random number generator for deterministic output
const seedRandom = (seed: number) => {
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

export const generateMaze = (size: number, seed?: number): MazeData => {
  const actualSeed = seed || getTodaySeed();
  const random = seedRandom(actualSeed);

  // Initialize grid
  const grid: Cell[][] = [];
  for (let y = 0; y < size; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < size; x++) {
      row.push({
        x,
        y,
        visited: false,
        walls: { top: true, right: true, bottom: true, left: true },
      });
    }
    grid.push(row);
  }

  // Generate maze using recursive backtracking
  const stack: Cell[] = [];
  
  // Start at a random position
  const randomIndex = Math.floor(random() * size);
  let current = grid[0][randomIndex];
  current.visited = true;
  stack.push(current);

  while (stack.length > 0) {
    current = stack.pop()!;
    const neighbors = getUnvisitedNeighbors(current, grid, size);
    
    if (neighbors.length > 0) {
      stack.push(current);
      
      // Use our seeded random function
      const randomNeighborIndex = Math.floor(random() * neighbors.length);
      const next = neighbors[randomNeighborIndex];
      
      removeWalls(current, next);
      
      next.visited = true;
      stack.push(next);
    }
  }

  // Reset visited states
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      grid[y][x].visited = false;
    }
  }

  // Set start and end positions (deterministic but based on seed)
  const startX = Math.floor(random() * (size / 3));
  const startPosition = { x: startX, y: 0 };
  
  const endX = size - 1 - Math.floor(random() * (size / 3));
  const endPosition = { x: endX, y: size - 1 };

  // Make sure start and end have an opening
  grid[startPosition.y][startPosition.x].walls.top = false;
  grid[endPosition.y][endPosition.x].walls.bottom = false;

  return {
    grid,
    size,
    startPosition,
    endPosition,
  };
};

const getUnvisitedNeighbors = (
  cell: Cell,
  grid: Cell[][],
  size: number
): Cell[] => {
  const { x, y } = cell;
  const neighbors: Cell[] = [];

  // Check four directions
  const directions = [
    { x: 0, y: -1, name: "top" },    // top
    { x: 1, y: 0, name: "right" },   // right
    { x: 0, y: 1, name: "bottom" },  // bottom
    { x: -1, y: 0, name: "left" },   // left
  ];

  for (const dir of directions) {
    const newX = x + dir.x;
    const newY = y + dir.y;

    if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
      const neighbor = grid[newY][newX];
      if (!neighbor.visited) {
        neighbors.push(neighbor);
      }
    }
  }

  return neighbors;
};

const removeWalls = (current: Cell, next: Cell) => {
  const xDiff = current.x - next.x;
  const yDiff = current.y - next.y;

  if (xDiff === 1) {
    // Next is to the left of current
    current.walls.left = false;
    next.walls.right = false;
  } else if (xDiff === -1) {
    // Next is to the right of current
    current.walls.right = false;
    next.walls.left = false;
  }

  if (yDiff === 1) {
    // Next is above current
    current.walls.top = false;
    next.walls.bottom = false;
  } else if (yDiff === -1) {
    // Next is below current
    current.walls.bottom = false;
    next.walls.top = false;
  }
};

export const solveMaze = (mazeData: MazeData): { path: [number, number][]; visited: [number, number][] } => {
  const { grid, startPosition, endPosition } = mazeData;
  const visited: [number, number][] = [];
  const path: [number, number][] = [];
  
  // Deep copy the grid for solving
  const solveGrid: boolean[][] = Array(grid.length)
    .fill(null)
    .map(() => Array(grid[0].length).fill(false));
  
  const success = findPath(
    startPosition.x,
    startPosition.y,
    endPosition.x,
    endPosition.y,
    solveGrid,
    grid,
    visited,
    path
  );
  
  return { path, visited };
};

const findPath = (
  x: number,
  y: number,
  endX: number,
  endY: number,
  solveGrid: boolean[][],
  grid: Cell[][],
  visited: [number, number][],
  path: [number, number][]
): boolean => {
  // Base case: if we're at the end
  if (x === endX && y === endY) {
    path.push([x, y]);
    return true;
  }

  // If out of bounds or already visited
  if (
    x < 0 ||
    y < 0 ||
    x >= grid[0].length ||
    y >= grid.length ||
    solveGrid[y][x]
  ) {
    return false;
  }

  // Mark as visited
  solveGrid[y][x] = true;
  visited.push([x, y]);
  path.push([x, y]);

  // Check all four directions based on walls
  const directions = [
    { x: 0, y: -1, wall: "top" },     // up
    { x: 1, y: 0, wall: "right" },    // right
    { x: 0, y: 1, wall: "bottom" },   // down
    { x: -1, y: 0, wall: "left" }     // left
  ];

  for (const dir of directions) {
    if (!grid[y][x].walls[dir.wall as keyof typeof grid[y][x].walls]) {
      if (findPath(
        x + dir.x,
        y + dir.y,
        endX,
        endY,
        solveGrid,
        grid,
        visited,
        path
      )) {
        return true;
      }
    }
  }

  // If no direction works, backtrack
  path.pop();
  return false;
};

export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const generateShareText = (moves: number, time: number, mazeNumber: number): string => {
  const timeStr = formatTime(time);
  return `DailyMaze #${mazeNumber}\n${moves} moves • ${timeStr}\n\n${"⬛".repeat(moves)}\n\nhttps://dailymaze.com`;
};
