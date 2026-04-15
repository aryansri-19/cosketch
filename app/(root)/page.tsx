"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [recentRooms, setRecentRooms] = useState<string[]>([]);

  useEffect(() => {
    // Load recent rooms from localStorage
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
    // Generate a random 8-character ID
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  function addToRecentRooms(roomId: string) {
    const rooms = JSON.parse(localStorage.getItem("cosketch-recent-rooms") || "[]");
    const updated = [roomId, ...rooms.filter((r: string) => r !== roomId)].slice(0, 5);
    localStorage.setItem("cosketch-recent-rooms", JSON.stringify(updated));
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-5xl font-bold text-orange-500">CoSketch</h1>
        <p className="text-lg text-muted-foreground">
          Create a room and invite others to collaborate in real-time
        </p>

        <Button
          onClick={createNewRoom}
          size="lg"
          className="gap-2 w-full"
        >
          <Plus className="h-5 w-5" />
          Create New Room
        </Button>

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
