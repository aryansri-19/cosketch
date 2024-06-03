import { Http2Server } from 'http2';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';

type Point = {
    x: number,
    y: number
}

type DrawLine = {
    prevPoint: Point | null,
    currentPoint: Point,
    color: string
}

export const GET = (req: NextApiRequest, res: NextApiResponse & { socket: { server: Http2Server & { io?: IOServer }}}) => {
    if(res.socket.server.io) {
        console.log('Socket already exists');
    } else {
        console.log('Socket inintializing');
        const io = new IOServer(res.socket.server)
        res.socket.server.io = io;

        let canvasState: string | null = null;

        io.on('connection', (socket) => {
            console.log("Connected")
    
            if(canvasState) {
                socket.emit('canvas-image', canvasState)
            }
            socket.on('draw-free', ({ prevPoint, currentPoint, color }: DrawLine) => {
                console.log('draw-free', { prevPoint, currentPoint, color });
                socket.broadcast.emit('draw-free', { prevPoint, currentPoint, color })
            })
            socket.on('clear-canvas', () => {
                console.log('clear-canvas');
                io.emit('clear-canvas')
                canvasState = null;
            })
            socket.on('canvas-state', (data) => {
                console.log('canvas-state', data);
                canvasState = data;
                socket.broadcast.emit('canvas-image', data)
            })
        })
    }

    res.end();
}