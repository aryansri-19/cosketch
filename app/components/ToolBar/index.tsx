'use client'
import { Button } from "@/components/ui/button";
import { useDraw } from "@/lib/hooks/useDraw";

const ToolBar = () => {
    const { clearCanvas } = useDraw();
    return ( 
        <footer className="absolute left-[25%] bottom-0 w-[50%] border-2 border-black rounded-lg flex justify-center items-center h-20 z-40 bg-background" >
            <Button variant='custom' size='default' className="text-foreground" onClick={clearCanvas}>Clear</Button>
        </footer>
     );
}
 
export default ToolBar;