import { useEffect, useRef, useState } from "react"

export const useDraw = (onDraw?: ({ctx, currentPoint, prevPoint}: Draw) => void) => {
    const [mouseDown, setMouseDown] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const prevPoint = useRef<Point | null>(null);

    const onMouseDown = () => setMouseDown(true);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if(!canvas) return;
        const ctx = canvasRef.current.getContext('2d');
        if(!ctx) return;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    useEffect(() => {

        const copyRef = canvasRef.current;

        const moveHandler = (e: MouseEvent) => {
            if (!mouseDown) return
            const currentPoint = coordInCanvas(e);
            const ctx = canvasRef.current?.getContext('2d');
            if(!ctx || !currentPoint) return;

            onDraw!({ ctx, currentPoint, prevPoint: prevPoint.current });
            prevPoint.current = currentPoint;
        }

        const coordInCanvas = (e: MouseEvent) => {
            const canvas = canvasRef.current
            if(!canvas) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            return { x, y }
        }

        const mouseUpHandler = () => {
            setMouseDown(false);
            prevPoint.current = null;
        }
        canvasRef.current?.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', mouseUpHandler);

        return () => {
            copyRef?.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseup', mouseUpHandler);
        }

    }, [onDraw, mouseDown]);

    return { canvasRef, onMouseDown, clearCanvas };
}