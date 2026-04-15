import PusherClient from "pusher-js";

const cluster = "ap2";

function getPusherClient(): PusherClient {
  const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;

  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_PUSHER_APP_KEY environment variable"
    );
  }

  return new PusherClient(key, {
    cluster,
    forceTLS: true,
  });
}

let pusherClientInstance: PusherClient | null = null;

export function getPusherClientInstance(): PusherClient {
  if (typeof window === "undefined") {
    throw new Error(
      "Pusher Client should not be used during SSR. Only use in client components."
    );
  }

  if (!pusherClientInstance) {
    pusherClientInstance = getPusherClient();
  }
  return pusherClientInstance;
}

export function resetPusherClient(): void {
  if (pusherClientInstance) {
    pusherClientInstance.disconnect();
    pusherClientInstance = null;
  }
}
