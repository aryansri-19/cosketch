"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type PusherClient from "pusher-js";
import { useDraw } from "@/lib/hooks/useDraw";
import ToolBar from "../../../components/ToolBar";
import { getPusherClientInstance, resetPusherClient } from "@/lib/pusher-client";
import {
  drawFreeEvent,
  canvasStateEvent,
  clearCanvasEvent,
} from "@/lib/actions/draw.action";
import type { DrawPayload } from "@/lib/types";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const channelName = `room-${roomId}`;

  const pusherRef = useRef<PusherClient | null>(null);
  const channelRef = useRef<ReturnType<PusherClient["subscribe"]> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeColor = isEraser ? "#FFFFFF" : color;

  const copyRoomLink = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  // Remote drawing handler - uses the canvas ref directly
  const handleRemoteDraw = useCallback(
    (payload: DrawPayload) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { prevPoint, currentPoint, color: strokeColor } = payload;
      const startPoint = prevPoint ?? currentPoint;

      ctx.beginPath();
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = strokeColor;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    },
    [brushSize]
  );

  const handleRemoteCanvasImage = useCallback((dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.onload = () => ctx.drawImage(image, 0, 0);
    image.src = dataUrl;
  }, []);

  const handleStartDraw = useCallback(
    async ({ prevPoint, currentPoint }: Omit<DrawPayload, "color">) => {
      try {
        await drawFreeEvent(channelName, {
          prevPoint,
          currentPoint,
          color: activeColor,
        });

        const canvas = canvasRef.current;
        if (canvas) {
          const dataUrl = canvas.toDataURL("image/png");
          await canvasStateEvent(channelName, dataUrl);
        }
      } catch (error) {
        console.error("Failed to broadcast drawing:", error);
      }
    },
    [activeColor, channelName]
  );

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const { onMouseDown, onTouchStart, isDrawing } =
    useDraw({
      canvasRef,
      onDraw: handleStartDraw,
      color: activeColor,
      lineWidth: brushSize,
    });

  // Setup Pusher connection
  useEffect(() => {
    let isMounted = true;

    const setupPusher = async () => {
      try {
        console.log("Setting up Pusher for channel:", channelName);
        const pusher = getPusherClientInstance();
        if (!isMounted) return;

        pusherRef.current = pusher;

        const channel = pusher.subscribe(channelName);
        channelRef.current = channel;

        // Bind events with explicit logging
        channel.bind("draw-free", (data: DrawPayload) => {
          console.log("Received draw-free event:", data);
          handleRemoteDraw(data);
        });
        
        channel.bind("canvas-image", (data: string) => {
          console.log("Received canvas-image event");
          handleRemoteCanvasImage(data);
        });
        
        channel.bind("clear-canvas", () => {
          console.log("Received clear-canvas event");
          clearCanvas();
        });

        pusher.connection.bind("connected", () => {
          console.log("Pusher connected to channel:", channelName);
          if (isMounted) setIsConnected(true);
        });

        pusher.connection.bind("disconnected", () => {
          console.log("Pusher disconnected");
          if (isMounted) setIsConnected(false);
        });

        // Bind connection error
        pusher.connection.bind("error", (error: Error) => {
          console.error("Pusher connection error:", error);
        });

        setIsConnected(pusher.connection.state === "connected");
      } catch (error) {
        console.error("Failed to setup Pusher:", error);
      }
    };

    setupPusher();

    return () => {
      console.log("Cleaning up Pusher connection");
      isMounted = false;

      if (channelRef.current) {
        channelRef.current.unbind("draw-free");
        channelRef.current.unbind("canvas-image");
        channelRef.current.unbind("clear-canvas");
      }

      if (pusherRef.current) {
        pusherRef.current.unsubscribe(channelName);
      }

      resetPusherClient();
    };
  }, [channelName, clearCanvas, handleRemoteCanvasImage, handleRemoteDraw]);

  const handleClear = useCallback(async () => {
    clearCanvas();
    try {
      await clearCanvasEvent(channelName);
    } catch (error) {
      console.error("Failed to broadcast clear:", error);
    }
  }, [clearCanvas, channelName]);

  return (
    <>
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3 bg-background/95 backdrop-blur px-4 py-2 rounded-full border shadow-sm">
        <span className="text-sm font-medium">Room: {roomId}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyRoomLink}
          className="h-8 gap-2"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
      </div>

      <div className="relative w-screen h-[93%] grow bg-white flex justify-center items-center bg-background overflow-hidden">
        <canvas
          id="canvas"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          width={1500}
          height={670}
          ref={canvasRef}
          className="border border-black cursor-crosshair touch-none"
        />
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-background/95 backdrop-blur px-3 py-1.5 rounded-full border shadow-sm">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-xs text-foreground">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
          {isDrawing && (
            <span className="text-xs text-foreground/60 ml-2">Drawing...</span>
          )}
        </div>
      </div>
      <ToolBar
        clearCanvas={handleClear}
        channelName={channelName}
        color={color}
        setColor={setColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        isEraser={isEraser}
        setIsEraser={setIsEraser}
      />
    </>
  );
}
