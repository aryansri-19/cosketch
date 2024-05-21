import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function drawFree({ prevPoint, currentPoint, ctx, color}: DrawFree) {
  const { x: currX, y: currY } = currentPoint;
  const startingPoint = prevPoint ?? currentPoint;
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#000';
  ctx.moveTo(startingPoint.x, startingPoint.y);
  ctx.lineTo(currX, currY);
  ctx.stroke();
}