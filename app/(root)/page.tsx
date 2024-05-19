'use client';
import { useDraw } from "@/lib/hooks/useDraw";

const Page = () => {

  const { canvasRef, onMouseDown, clearCanvas } = useDraw(drawFree);

  function drawFree({ prevPoint, currentPoint, ctx}: Draw) {
    const { x: currX, y: currY } = currentPoint;
    const startingPoint = prevPoint ?? currentPoint;
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#000';
    ctx.moveTo(startingPoint.x, startingPoint.y);
    ctx.lineTo(currX, currY);
    ctx.stroke();
  }
  return ( 
    <div className="w-screen h-[93%] grow bg-white flex justify-center items-center bg-background overflow-hidden">
      <canvas onMouseDown={onMouseDown} width={1500} height={650} ref={canvasRef} id="canvas" className="border border-black"/>
    </div>
   );
}
 
export default Page;