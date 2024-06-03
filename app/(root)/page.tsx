"use client";
import { useEffect } from "react";
import { drawFree } from "@/lib/utils";
import { useDraw } from "@/lib/hooks/useDraw";
import ToolBar from "../components/ToolBar";
import { io, Socket } from "socket.io-client";

var socket: Socket | null;

const Page = () => {
  const { canvasRef, onMouseDown, clearCanvas } = useDraw(startDrawFree);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    async function socketInit() {
      await fetch("/api/socket", { method: "GET" });
      socket = io();

      socket.on("canvas-image", (data: string) => {
        const image = new Image();
        image.src = data;
        image.onload = () => ctx?.drawImage(image, 0, 0);
      });

      socket.on("draw-free", ({ prevPoint, currentPoint, color }: DrawFree) => {
        if (!ctx) return;
        drawFree({ prevPoint, currentPoint, ctx, color });
      });
      socket.on("clear-canvas", clearCanvas);
    }
    socketInit();
    return () => {
      if (socket) {
        socket.off('draw-free');
        socket.off('clear-canvas');
        socket.off('canvas-image');
      }
    };
  }, []);

  function startDrawFree({ prevPoint, currentPoint, ctx }: Draw) {
    if(socket) {
      socket.emit("draw-free", { prevPoint, currentPoint, color: "#000" });
      drawFree({ prevPoint, currentPoint, ctx, color: "#000" });

      if (canvasRef.current?.toDataURL()) {
        socket?.emit("canvas-state", canvasRef.current.toDataURL());
      }
    }
  }

  return (
    <>
      <div className="w-screen h-[93%] grow bg-white flex justify-center items-center bg-background overflow-hidden">
        <canvas
          onMouseDown={onMouseDown}
          width={1500}
          height={670}
          ref={canvasRef}
          id="canvas"
          className="border border-black"
        />
      </div>
      <ToolBar socket={socket!} clearCanvas={clearCanvas} />
    </>
  );
};

export default Page;
