
import { Cell, MazeData } from "./mazeTypes";
import { seedRandom, getTodaySeed } from "./dateUtils";

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
        hasMine: false,
        hasPowerup: false,
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

  // Add mines and powerups (but not at start or end)
  const numberOfMines = Math.floor(size * size * 0.05); // 5% of cells have mines
  const numberOfPowerups = Math.floor(size * size * 0.03); // 3% of cells have powerups
  
  let minesAdded = 0;
  let powerupsAdded = 0;
  
  while (minesAdded < numberOfMines) {
    const x = Math.floor(random() * size);
    const y = Math.floor(random() * size);
    
    // Don't place mines at start, end, or where there's already a mine or powerup
    if ((x !== startPosition.x || y !== startPosition.y) && 
        (x !== endPosition.x || y !== endPosition.y) &&
        !grid[y][x].hasMine && !grid[y][x].hasPowerup) {
      grid[y][x].hasMine = true;
      minesAdded++;
    }
  }
  
  while (powerupsAdded < numberOfPowerups) {
    const x = Math.floor(random() * size);
    const y = Math.floor(random() * size);
    
    // Don't place powerups at start, end, or where there's already a mine or powerup
    if ((x !== startPosition.x || y !== startPosition.y) && 
        (x !== endPosition.x || y !== endPosition.y) &&
        !grid[y][x].hasMine && !grid[y][x].hasPowerup) {
      grid[y][x].hasPowerup = true;
      powerupsAdded++;
    }
  }

  return {
    grid,
    size,
    startPosition,
    endPosition,
  };
};
