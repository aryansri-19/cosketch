"use client";
import { Button } from "@/components/ui/button";
import { clearCanvasEvent } from "@/lib/actions/draw.action";

interface ToolBarProps {
  clearCanvas: () => void;
  channelName: string;
}
const ToolBar = (props: ToolBarProps) => {
  async function clear() {
    props.clearCanvas();
    await clearCanvasEvent();
  }
  return (
    <footer className="absolute left-[25%] bottom-0 w-[50%] border-2 border-black rounded-lg flex justify-evenly items-center h-20 z-40 bg-background">
      <Button
        variant="custom"
        size="default"
        className="text-foreground"
        onClick={clear}
      >
        Clear
      </Button>
    </footer>
  );
};

export default ToolBar;
