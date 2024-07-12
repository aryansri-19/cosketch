"use client";
import { useEffect } from "react";
import { drawFree } from "@/lib/utils";
import { useDraw } from "@/lib/hooks/useDraw";
import ToolBar from "../components/ToolBar";
import { pusherClient } from "@/lib/pusher";
import { canvasStateEvent, drawFreeEvent } from "@/lib/actions/draw.action";

const CHANNEL_NAME = "drawing-channel";

const Page = () => {
  const { canvasRef, onMouseDown, clearCanvas } = useDraw(startDrawFree);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    pusherClient.subscribe(CHANNEL_NAME);

    pusherClient.bind("canvas-image", (data: string) => {
      const image = new Image();
      image.src = data;
      image.onload = () => ctx?.drawImage(image, 0, 0);
    });

    pusherClient.bind(
      "draw-free",
      ({ ctx, prevPoint, currentPoint, color }: Draw) => {
        if (!ctx) return;
        drawFree({ prevPoint, currentPoint, ctx, color });
      }
    );

    pusherClient.bind("clear-canvas", clearCanvas);

    return () => {
      pusherClient.unsubscribe(CHANNEL_NAME);
      pusherClient.unbind("canvas-image");
      pusherClient.unbind("draw-free");
      pusherClient.unbind("clear-canvas");
    };
  }, [canvasRef, clearCanvas]);

  async function startDrawFree({ prevPoint, currentPoint, ctx, color }: Draw) {
    await drawFreeEvent({ prevPoint, currentPoint, ctx, color });

    if (canvasRef.current?.toDataURL()) {
      await canvasStateEvent(canvasRef.current.toDataURL());
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
      <ToolBar clearCanvas={clearCanvas} channelName={CHANNEL_NAME} />
    </>
  );
};

export default Page;
