const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)

import { Server } from 'socket.io'

const io = new Server(server, {
    cors: {
        origin: '*',
    }
})

type Point = {
    x: number,
    y: number
}

type DrawLine = {
    prevPoint: Point | null,
    currentPoint: Point,
    color: string
}

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

server.listen(8080, () => {
    console.log('Server running on port 8080')
})