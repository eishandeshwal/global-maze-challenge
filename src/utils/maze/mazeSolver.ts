
import { MazeData, Cell, Position } from "./mazeTypes";

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
    const wallProperty = dir.wall as keyof Cell["walls"];
    if (!grid[y][x].walls[wallProperty]) {
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
