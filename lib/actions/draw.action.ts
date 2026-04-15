"use server";

import { getPusherServerInstance } from "@/lib/pusher-server";
import type { DrawPayload } from "@/lib/types";

export async function drawFreeEvent(
  channelName: string,
  data: DrawPayload
): Promise<void> {
  try {
    const pusher = getPusherServerInstance();
    await pusher.trigger(channelName, "draw-free", data);
  } catch (error) {
    console.error("Failed to trigger draw-free event:", error);
    throw new Error("Failed to broadcast drawing event");
  }
}

export async function canvasStateEvent(
  channelName: string,
  canvasData: string
): Promise<void> {
  try {
    const pusher = getPusherServerInstance();
    await pusher.trigger(channelName, "canvas-image", canvasData);
  } catch (error) {
    console.error("Failed to trigger canvas-image event:", error);
    throw new Error("Failed to broadcast canvas state");
  }
}

export async function clearCanvasEvent(channelName: string): Promise<void> {
  try {
    const pusher = getPusherServerInstance();
    await pusher.trigger(channelName, "clear-canvas", {});
  } catch (error) {
    console.error("Failed to trigger clear-canvas event:", error);
    throw new Error("Failed to broadcast clear canvas event");
  }
}
