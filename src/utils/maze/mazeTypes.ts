
export interface Cell {
  x: number;
  y: number;
  visited: boolean;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
}

export interface MazeData {
  grid: Cell[][];
  size: number;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
}

export interface Position {
  x: number;
  y: number;
}
