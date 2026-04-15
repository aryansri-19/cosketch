"use client";

import { Button } from "@/components/ui/button";
import { clearCanvasEvent } from "@/lib/actions/draw.action";
import { Eraser, Pencil, Trash2 } from "lucide-react";

interface ToolBarProps {
  clearCanvas: () => void;
  channelName: string;
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  isEraser: boolean;
  setIsEraser: (isEraser: boolean) => void;
}

const COLORS = [
  { value: "#000000", label: "Black" },
  { value: "#FF0000", label: "Red" },
  { value: "#00FF00", label: "Green" },
  { value: "#0000FF", label: "Blue" },
  { value: "#FFFF00", label: "Yellow" },
  { value: "#FF00FF", label: "Magenta" },
  { value: "#00FFFF", label: "Cyan" },
  { value: "#FFA500", label: "Orange" },
  { value: "#800080", label: "Purple" },
  { value: "#FFFFFF", label: "White" },
];

export default function ToolBar({
  clearCanvas,
  channelName,
  color,
  setColor,
  brushSize,
  setBrushSize,
  isEraser,
  setIsEraser,
}: ToolBarProps) {
  async function handleClear() {
    clearCanvas();
    try {
      await clearCanvasEvent(channelName);
    } catch (error) {
      console.error("Failed to broadcast clear:", error);
    }
  }

  return (
    <footer className="absolute left-[5%] right-[5%] bottom-4 border border-border rounded-xl flex flex-wrap justify-center items-center gap-4 p-4 z-40 bg-background/95 backdrop-blur shadow-lg">
      {/* Tools */}
      <div className="flex items-center gap-2 border-r border-border pr-4">
        <Button
          variant={isEraser ? "outline" : "default"}
          size="icon"
          onClick={() => setIsEraser(false)}
          className="h-10 w-10"
          title="Pencil"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant={isEraser ? "default" : "outline"}
          size="icon"
          onClick={() => setIsEraser(true)}
          className="h-10 w-10"
          title="Eraser"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-2 border-r border-border pr-4">
        {COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => {
              setColor(c.value);
              setIsEraser(false);
            }}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              color === c.value && !isEraser
                ? "border-primary scale-110"
                : "border-transparent hover:scale-105"
            } ${c.value === "#FFFFFF" ? "border-gray-300" : ""}`}
            style={{ backgroundColor: c.value }}
            title={c.label}
          />
        ))}
      </div>

      {/* Brush Size */}
      <div className="flex items-center gap-3 border-r border-border pr-4">
        <span className="text-sm text-muted-foreground">Size:</span>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-24 accent-primary"
        />
        <span className="text-sm font-medium w-6">{brushSize}</span>
      </div>

      {/* Clear Button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={handleClear}
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Clear
      </Button>
    </footer>
  );
}
