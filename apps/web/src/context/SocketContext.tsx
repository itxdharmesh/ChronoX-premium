'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    // Initializing the active gateway endpoint layer connection pool
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    const socketInstance = io(socketUrl, {
      path: '/api/socket/io',
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      console.log("Socket node client handshake state verified.");
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
      console.log("Socket client runtime pool context closed.");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket hook execution constraint: must be consumed within a SocketProvider wrapper.");
  }
  return context;
}
