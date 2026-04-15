import PusherServer from "pusher";

const cluster = "ap2";
const useTLS = true;

function getPusherServer(): PusherServer {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_APP_KEY;
  const secret = process.env.PUSHER_APP_SECRET;

  if (!appId || !key || !secret) {
    throw new Error(
      "Missing Pusher environment variables. Required: PUSHER_APP_ID, PUSHER_APP_KEY, PUSHER_APP_SECRET"
    );
  }

  return new PusherServer({
    appId,
    key,
    secret,
    cluster,
    useTLS,
  });
}

let pusherServerInstance: PusherServer | null = null;

export function getPusherServerInstance(): PusherServer {
  if (typeof window !== "undefined") {
    throw new Error(
      "Pusher Server should not be used on the client side. Use lib/pusher-client instead."
    );
  }

  if (!pusherServerInstance) {
    pusherServerInstance = getPusherServer();
  }
  return pusherServerInstance;
}
