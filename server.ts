import next from 'next';
import { Server, createServer } from 'node:http';
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

const dev = process.env.NODE_ENV !== 'production';
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer: Server = createServer(handler);

    const io: IOServer = new IOServer(httpServer);

    io.on('connection', (socket) => {
        console.log("Connected")
        socket.on('draw-free', ({ prevPoint, currentPoint, color }: DrawLine) => {
            socket.broadcast.emit('draw-free', { prevPoint, currentPoint, color })
        })
        socket.on('clear-canvas', () => {
            io.emit('clear-canvas')
        })

        socket.on('client-ready', () => {
            socket.emit('get-canvas-state')
        })

        socket.on('canvas-state', (data) => {
            socket.broadcast.emit('canvas-image', data)
        })
    })

    httpServer.once("error", (err) => {
        console.log(err);
        process.exit(1);
    })
    .listen(port, () => {
        console.log(`> Ready on ${hostname}:${port}`);
    })
})