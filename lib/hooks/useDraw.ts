"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DrawPayload, Point } from "@/lib/types";

const BROADCAST_THROTTLE_MS = 50;

function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let pendingArgs: Parameters<T> | null = null;

  const execute = () => {
    if (pendingArgs) {
      (func as (...args: any[]) => void)(...pendingArgs);
      pendingArgs = null;
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (pendingArgs) execute();
      }, limit);
    }
  };

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (pendingArgs) execute();
      }, limit);
    } else {
      pendingArgs = args;
    }
  };
}

interface UseDrawOptions {
  onDraw?: (payload: DrawPayload) => Promise<void> | void;
  color?: string;
  lineWidth?: number;
}

interface UseDrawReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  clearCanvas: () => void;
  isDrawing: boolean;
}

export function useDraw(options: UseDrawOptions = {}): UseDrawReturn {
  const { onDraw, color = "black", lineWidth = 5 } = options;

  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPointRef = useRef<Point | null>(null);
  const isDrawingRef = useRef(false);

  // Sync isDrawing state with ref for event handlers
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const drawLine = useCallback(
    (from: Point, to: Point) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    },
    [color, lineWidth]
  );

  // Throttled broadcast function
  const throttledBroadcast = useRef(
    throttle((payload: DrawPayload) => {
      onDraw?.(payload);
    }, BROADCAST_THROTTLE_MS)
  );

  // Update throttled function when onDraw changes
  useEffect(() => {
    throttledBroadcast.current = throttle((payload: DrawPayload) => {
      onDraw?.(payload);
    }, BROADCAST_THROTTLE_MS);
  }, [onDraw]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDrawingRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const currentPoint: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      const prevPoint = prevPointRef.current;

      if (prevPoint) {
        // Draw line from previous point to current point
        drawLine(prevPoint, currentPoint);

        // Broadcast (throttled)
        throttledBroadcast.current({
          prevPoint,
          currentPoint,
          color,
        });
      }

      // Always update prevPoint to current for next segment
      prevPointRef.current = currentPoint;
    },
    [color, drawLine]
  );

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    // Set the starting point
    prevPointRef.current = point;
    setIsDrawing(true);
    isDrawingRef.current = true;
  }, []);

  const onMouseUp = useCallback(() => {
    setIsDrawing(false);
    isDrawingRef.current = false;
    prevPointRef.current = null;
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsDrawing(false);
    isDrawingRef.current = false;
    prevPointRef.current = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use non-throttled handler for smooth local drawing
    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [handleMouseMove, onMouseUp, onMouseLeave]);

  return {
    canvasRef,
    onMouseDown,
    clearCanvas,
    isDrawing,
  };
}
