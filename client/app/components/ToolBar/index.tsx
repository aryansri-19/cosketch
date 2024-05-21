'use client'
import { Button } from "@/components/ui/button";
import { Socket } from "socket.io-client";

interface ToolBarProps {
    clearCanvas: () => void,
    socket: Socket,
}
const ToolBar = (props: ToolBarProps) => {
    function clear() {
        props.clearCanvas();
        props.socket.emit('clear-canvas');
    }
    return ( 
        <footer className="absolute left-[25%] bottom-0 w-[50%] border-2 border-black rounded-lg flex justify-evenly items-center h-20 z-40 bg-background" >
            <Button variant='custom' size='default' className="text-foreground" onClick={clear}>Clear</Button>
        </footer>
     );
}
 
export default ToolBar;