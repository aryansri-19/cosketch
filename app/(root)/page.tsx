'use client';
import { useEffect } from "react";
import { drawFree } from "@/lib/utils";
import { useDraw } from "@/lib/hooks/useDraw";
import ToolBar from "../components/ToolBar";
import { socket } from '@/socket'

const Page = () => {

  const { canvasRef, onMouseDown, clearCanvas } = useDraw(startDrawFree);

  useEffect(() =>{
    const ctx = canvasRef.current?.getContext('2d');
    socket.emit('client-ready')

    socket.on('get-canvas-state', () => {
      if(!canvasRef.current?.toDataURL()) return;
      socket.emit('canvas-state', canvasRef.current.toDataURL())
    })

    socket.on('canvas-image', (data: string) => {
      const image = new Image();
      image.src = data;
      image.onload = () => ctx?.drawImage(image, 0, 0);
    })

    socket.on('draw-free', ({ prevPoint, currentPoint, color }: DrawFree) => {
      if(!ctx) return;
      drawFree({ prevPoint, currentPoint, ctx, color });
    })
    socket.on('clear-canvas', clearCanvas)

    return () => {
      socket.off('draw-free')
      socket.off('clear-canvas')
      socket.off('get-canvas-state')
      socket.off('canvas-state')
    }
  }, [canvasRef, clearCanvas])

  function startDrawFree({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit('draw-free', ({ prevPoint, currentPoint, color: '#000' }))
    drawFree({ prevPoint, currentPoint, ctx, color: '#000' })
  }

  return ( 
    <>
      <div className="w-screen h-[93%] grow bg-white flex justify-center items-center bg-background overflow-hidden">
        <canvas onMouseDown={onMouseDown} width={1500} height={650} ref={canvasRef} id="canvas" className="border border-black"/>
      </div>
      <ToolBar socket={socket} clearCanvas={clearCanvas}/>
    </>
   );
}
 
export default Page;