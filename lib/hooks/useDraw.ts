"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DrawPayload, Point } from "@/lib/types";

const THROTTLE_MS = 16; // ~60fps

function throttle<T extends (...args: Parameters<T>) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
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
  onMouseDown: () => void;
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

  const drawLocal = useCallback(
    (payload: DrawPayload) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { prevPoint, currentPoint } = payload;
      const startPoint = prevPoint ?? currentPoint;

      ctx.beginPath();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    },
    [color, lineWidth]
  );

  const handleDraw = useCallback(
    async (e: MouseEvent) => {
      if (!isDrawingRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const currentPoint: Point = { x, y };

      const payload: DrawPayload = {
        prevPoint: prevPointRef.current,
        currentPoint,
        color,
      };

      // Draw locally immediately
      drawLocal(payload);

      // Notify parent (throttled externally if needed)
      await onDraw?.(payload);

      prevPointRef.current = currentPoint;
    },
    [color, drawLocal, onDraw]
  );

  const throttledHandleDraw = useCallback(
    throttle(handleDraw, THROTTLE_MS),
    [handleDraw]
  );

  const onMouseDown = useCallback(() => {
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

    canvas.addEventListener("mousemove", throttledHandleDraw);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", throttledHandleDraw);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [throttledHandleDraw, onMouseUp, onMouseLeave]);

  return {
    canvasRef,
    onMouseDown,
    clearCanvas,
    isDrawing,
  };
}
