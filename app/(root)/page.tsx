"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, LogIn } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [recentRooms, setRecentRooms] = useState<string[]>([]);
  const [roomIdInput, setRoomIdInput] = useState("");

  useEffect(() => {
    const rooms = localStorage.getItem("cosketch-recent-rooms");
    if (rooms) {
      setRecentRooms(JSON.parse(rooms));
    }
  }, []);

  function createNewRoom() {
    const roomId = generateRoomId();
    addToRecentRooms(roomId);
    router.push(`/room/${roomId}`);
  }

  function generateRoomId(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  function addToRecentRooms(roomId: string) {
    const rooms = JSON.parse(localStorage.getItem("cosketch-recent-rooms") || "[]");
    const updated = [roomId, ...rooms.filter((r: string) => r !== roomId)].slice(0, 5);
    localStorage.setItem("cosketch-recent-rooms", JSON.stringify(updated));
  }

  function joinRoom(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const roomId = roomIdInput.trim().toUpperCase();
    if (roomId) {
      addToRecentRooms(roomId);
      router.push(`/room/${roomId}`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <h1 className="text-5xl font-bold text-orange-500">CoSketch</h1>
        <p className="text-lg text-muted-foreground">
          Create a room or join one to collaborate in real-time
        </p>

        {/* Create Room */}
        <Button
          onClick={createNewRoom}
          size="lg"
          className="gap-2 w-full"
        >
          <Plus className="h-5 w-5" />
          Create New Room
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Join Room */}
        <form onSubmit={joinRoom} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter Room ID"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
            className="uppercase"
            maxLength={8}
          />
          <Button 
            type="submit" 
            variant="outline"
            disabled={!roomIdInput.trim()}
          >
            <LogIn className="h-4 w-4" />
          </Button>
        </form>

        {recentRooms.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recent Rooms
            </h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {recentRooms.map((roomId) => (
                <Button
                  key={roomId}
                  variant="outline"
                  onClick={() => router.push(`/room/${roomId}`)}
                >
                  {roomId}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
