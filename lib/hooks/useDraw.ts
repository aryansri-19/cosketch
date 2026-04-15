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
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onDraw?: (payload: DrawPayload) => Promise<void> | void;
  color?: string;
  lineWidth?: number;
}

interface UseDrawReturn {
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  isDrawing: boolean;
}

export function useDraw(options: UseDrawOptions): UseDrawReturn {
  const { canvasRef, onDraw, color = "#000000", lineWidth = 5 } = options;

  const [isDrawing, setIsDrawing] = useState(false);
  const prevPointRef = useRef<Point | null>(null);
  const isDrawingRef = useRef(false);
  const colorRef = useRef(color);
  const lineWidthRef = useRef(lineWidth);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    lineWidthRef.current = lineWidth;
  }, [lineWidth]);

  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  const drawLine = useCallback((from: Point, to: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.lineWidth = lineWidthRef.current;
    ctx.strokeStyle = colorRef.current;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }, [canvasRef]);

  const throttledBroadcast = useRef(
    throttle((payload: DrawPayload) => {
      onDraw?.(payload);
    }, BROADCAST_THROTTLE_MS)
  );

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
        drawLine(prevPoint, currentPoint);
        throttledBroadcast.current({
          prevPoint,
          currentPoint,
          color: colorRef.current,
        });
      }

      prevPointRef.current = currentPoint;
    },
    [canvasRef, drawLine]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const currentPoint: Point = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };

      const prevPoint = prevPointRef.current;

      if (prevPoint) {
        drawLine(prevPoint, currentPoint);
        throttledBroadcast.current({
          prevPoint,
          currentPoint,
          color: colorRef.current,
        });
      }

      prevPointRef.current = currentPoint;
    },
    [canvasRef, drawLine]
  );

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    prevPointRef.current = point;
    setIsDrawing(true);
    isDrawingRef.current = true;
  }, [canvasRef]);

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const point: Point = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };

    prevPointRef.current = point;
    setIsDrawing(true);
    isDrawingRef.current = true;
  }, [canvasRef]);

  const onMouseUp = useCallback(() => {
    setIsDrawing(false);
    isDrawingRef.current = false;
    prevPointRef.current = null;
  }, []);

  const onTouchEnd = useCallback(() => {
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

    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);

    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseLeave);

      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [
    canvasRef,
    handleMouseMove,
    handleTouchMove,
    onMouseUp,
    onTouchEnd,
    onMouseLeave,
  ]);

  return {
    onMouseDown,
    onTouchStart,
    isDrawing,
  };
}
