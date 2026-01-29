'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from './store';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { project, fetchTeam, fetchTasks, fetchRisks } = useAppStore();

  useEffect(() => {
    const socketUrl = (import.meta as any).env?.VITE_API_URL?.replace('/api', '') || 'https://octo-ops-backend.onrender.com';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000,
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id);
      setIsConnected(true);
      
      if (project?._id) {
        newSocket.emit('join-project', project._id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('team-updated', (data) => {
      console.log('📢 Team updated:', data);
      fetchTeam();
      if (data.tasksAssigned > 0) {
        fetchTasks();
      }
    });

    newSocket.on('tasks-updated', (data) => {
      console.log('📢 Tasks updated:', data);
      fetchTasks();
    });

    newSocket.on('risk-resolved', (data) => {
      console.log('📢 Risk resolved:', data);
      fetchRisks();
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket && isConnected && project?._id) {
      socket.emit('join-project', project._id);
      
      return () => {
        socket.emit('leave-project', project._id);
      };
    }
  }, [socket, isConnected, project?._id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
