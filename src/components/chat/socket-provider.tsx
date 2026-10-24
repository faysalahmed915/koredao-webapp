
"use client";

import * as React from "react";
import { io, type Socket } from "socket.io-client";
import { getChatSocketBaseUrl } from "@/lib/chat-api";

interface ChatSocketProviderProps {
  userId: string | null;
}

type SocketStatus = "connecting" | "online" | "offline";

interface SocketSnapshot {
  socket: Socket | null;
  status: SocketStatus;
}

const EMPTY_SNAPSHOT: SocketSnapshot = {
  socket: null,
  status: "offline",
};

// Stable fallback functions for consumers outside the provider.
const emptySubscribe = () => () => {};
const getEmptySnapshot = () => EMPTY_SNAPSHOT;

class ChatSocketStore {
  private listeners = new Set<() => void>();
  private socket: Socket | null = null;
  private cleanupSocket: (() => void) | null = null;
  private started = false;

  private snapshot: SocketSnapshot;
  private readonly serverSnapshot: SocketSnapshot;

  constructor(private readonly userId: string | null) {
    this.snapshot = {
      socket: null,
      status: userId ? "connecting" : "offline",
    };

    this.serverSnapshot = this.snapshot;
  }

  // Subscribe React to changes in the socket snapshot.
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  // Return the cached snapshot. Do not create a new object here.
  getSnapshot = () => this.snapshot;

  // Keep the server-rendered snapshot stable during hydration.
  getServerSnapshot = () => this.serverSnapshot;

  private publish(snapshot: SocketSnapshot) {
    if (
      this.snapshot.socket === snapshot.socket &&
      this.snapshot.status === snapshot.status
    ) {
      return;
    }

    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());
  }

  // Connect once for this authenticated user.
  connect = () => {
    if (!this.userId || this.started) return;

    this.started = true;

    const socket = io(`${getChatSocketBaseUrl()}/chat`, {
      transports: ["polling", "websocket"],
      withCredentials: true,
      query: { userId: this.userId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket = socket;

    const onConnect = () => {
      this.publish({ socket, status: "online" });
    };

    const onDisconnect = () => {
      this.publish({ socket, status: "offline" });
    };

    const onConnectError = () => {
      this.publish({ socket, status: "offline" });
    };

    // Register only the listeners owned by this provider.
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    // Expose the socket immediately, even while connecting.
    this.publish({
      socket,
      status: socket.connected ? "online" : "connecting",
    });

    this.cleanupSocket = () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  };

  // Disconnect when logging out, switching users, or unmounting.
  disconnect = () => {
    const socket = this.socket;

    this.socket = null;
    this.started = false;

    this.cleanupSocket?.();
    this.cleanupSocket = null;

    socket?.disconnect();

    this.publish({
      socket: null,
      status: "offline",
    });
  };
}

const ChatSocketContext =
  React.createContext<ChatSocketStore | null>(null);

export function ChatSocketProvider({
  userId,
  children,
}: React.PropsWithChildren<ChatSocketProviderProps>) {
  // Recreate the store only when the authenticated user changes.
  const store = React.useMemo(
    () => new ChatSocketStore(userId),
    [userId]
  );

  React.useEffect(() => {
    store.connect();

    // Effect cleanup manages the external socket connection.
    return store.disconnect;
  }, [store]);

  return (
    <ChatSocketContext.Provider value={store}>
      {children}
    </ChatSocketContext.Provider>
  );
}

// Shared subscription hook used by both public hooks below.
function useChatSocketSnapshot(): SocketSnapshot {
  const store = React.useContext(ChatSocketContext);

  return React.useSyncExternalStore(
    store?.subscribe ?? emptySubscribe,
    store?.getSnapshot ?? getEmptySnapshot,
    store?.getServerSnapshot ?? getEmptySnapshot
  );
}

/** Returns the shared Socket.IO socket, or null if unavailable. */
export function useChatSocket(): Socket | null {
  return useChatSocketSnapshot().socket;
}

/** Returns the current WebSocket connection status. */
export function useChatSocketStatus(): SocketStatus {
  return useChatSocketSnapshot().status;
}
