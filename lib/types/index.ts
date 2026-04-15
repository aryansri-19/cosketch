export interface Point {
  x: number;
  y: number;
}

export interface DrawPayload {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
}

export interface Draw extends DrawPayload {
  ctx: CanvasRenderingContext2D;
}
