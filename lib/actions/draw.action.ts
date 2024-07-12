import { pusherServer } from "../pusher";
import { drawFree } from "../utils";

type Point = {
    x: number;
    y: number;
};

type Draw = {
    prevPoint: Point | null;
    currentPoint: Point;
    ctx: CanvasRenderingContext2D;
    color: string;
};

const channel = 'drawing-channel';

export const drawFreeEvent = async (data: Draw) => {
    console.log('draw-free', data);
    await pusherServer.trigger(channel, 'draw-free', data);
    drawFree(data);
}

export const canvasStateEvent = async (data: string) => {
    console.log('canvas-state', data);
    await pusherServer.trigger(channel, 'canvas-image', data);
}

export const clearCanvasEvent = async () => {
    console.log('clear-canvas');
    await pusherServer.trigger(channel, 'clear-canvas', {});
}