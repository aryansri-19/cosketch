"use server";

import { getPusherServerInstance } from "@/lib/pusher-server";
import type { DrawPayload } from "@/lib/types";

const CHANNEL_NAME = "drawing-channel";

export async function drawFreeEvent(data: DrawPayload): Promise<void> {
  try {
    const pusher = getPusherServerInstance();
    await pusher.trigger(CHANNEL_NAME, "draw-free", data);
  } catch (error) {
    console.error("Failed to trigger draw-free event:", error);
    throw new Error("Failed to broadcast drawing event");
  }
}

export async function canvasStateEvent(canvasData: string): Promise<void> {
  try {
    const pusher = getPusherServerInstance();
    await pusher.trigger(CHANNEL_NAME, "canvas-image", canvasData);
  } catch (error) {
    console.error("Failed to trigger canvas-image event:", error);
    throw new Error("Failed to broadcast canvas state");
  }
}

export async function clearCanvasEvent(): Promise<void> {
  try {
    const pusher = getPusherServerInstance();
    await pusher.trigger(CHANNEL_NAME, "clear-canvas", {});
  } catch (error) {
    console.error("Failed to trigger clear-canvas event:", error);
    throw new Error("Failed to broadcast clear canvas event");
  }
}
