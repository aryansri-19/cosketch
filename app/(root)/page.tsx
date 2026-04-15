"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type PusherClient from "pusher-js";
import { useDraw } from "@/lib/hooks/useDraw";
import ToolBar from "../components/ToolBar";
import { getPusherClientInstance, resetPusherClient } from "@/lib/pusher-client";
import {
  drawFreeEvent,
  canvasStateEvent,
  clearCanvasEvent,
} from "@/lib/actions/draw.action";
import type { DrawPayload, Point } from "@/lib/types";

const CHANNEL_NAME = "drawing-channel";

export default function Page() {
  const pusherRef = useRef<PusherClient | null>(null);
  const channelRef = useRef<ReturnType<PusherClient["subscribe"]> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleRemoteDraw = useCallback(
    (payload: DrawPayload) => {
      const canvas = document.getElementById("canvas") as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { prevPoint, currentPoint, color } = payload;
      const startPoint = prevPoint ?? currentPoint;

      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    },
    []
  );

  const handleRemoteCanvasImage = useCallback((dataUrl: string) => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.onload = () => ctx.drawImage(image, 0, 0);
    image.src = dataUrl;
  }, []);

  const handleStartDraw = useCallback(
    async ({ prevPoint, currentPoint, color }: DrawPayload) => {
      try {
        await drawFreeEvent({ prevPoint, currentPoint, color });

        const canvas = canvasRef.current;
        if (canvas) {
          const dataUrl = canvas.toDataURL("image/png");
          await canvasStateEvent(dataUrl);
        }
      } catch (error) {
        console.error("Failed to broadcast drawing:", error);
      }
    },
    []
  );

  const { canvasRef, onMouseDown, clearCanvas, isDrawing } = useDraw({
    onDraw: handleStartDraw,
    color: "black",
    lineWidth: 5,
  });

  // Setup Pusher connection
  useEffect(() => {
    let isMounted = true;

    const setupPusher = async () => {
      try {
        const pusher = getPusherClientInstance();
        if (!isMounted) return;

        pusherRef.current = pusher;

        const channel = pusher.subscribe(CHANNEL_NAME);
        channelRef.current = channel;

        channel.bind("draw-free", handleRemoteDraw);
        channel.bind("canvas-image", handleRemoteCanvasImage);
        channel.bind("clear-canvas", clearCanvas);

        pusher.connection.bind("connected", () => {
          if (isMounted) setIsConnected(true);
        });

        pusher.connection.bind("disconnected", () => {
          if (isMounted) setIsConnected(false);
        });

        setIsConnected(pusher.connection.state === "connected");
      } catch (error) {
        console.error("Failed to setup Pusher:", error);
      }
    };

    setupPusher();

    return () => {
      isMounted = false;

      if (channelRef.current) {
        channelRef.current.unbind("draw-free", handleRemoteDraw);
        channelRef.current.unbind("canvas-image", handleRemoteCanvasImage);
        channelRef.current.unbind("clear-canvas", clearCanvas);
      }

      if (pusherRef.current) {
        pusherRef.current.unsubscribe(CHANNEL_NAME);
      }

      resetPusherClient();
    };
  }, [clearCanvas, handleRemoteCanvasImage, handleRemoteDraw]);

  const handleClear = useCallback(async () => {
    clearCanvas();
    try {
      await clearCanvasEvent();
    } catch (error) {
      console.error("Failed to broadcast clear:", error);
    }
  }, [clearCanvas]);

  return (
    <>
      <div className="relative w-screen h-[93%] grow bg-white flex justify-center items-center bg-background overflow-hidden">
        <canvas
          id="canvas"
          onMouseDown={onMouseDown}
          width={1500}
          height={670}
          ref={canvasRef}
          className="border border-black cursor-crosshair"
          style={{ touchAction: "none" }}
        />
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-1.5 rounded-full border">
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
      <ToolBar clearCanvas={handleClear} channelName={CHANNEL_NAME} />
    </>
  );
}
