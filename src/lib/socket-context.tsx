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
    // Connect to WebSocket server
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id);
      setIsConnected(true);
      
      // Join project room if project exists
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

    // Listen for team updates
    newSocket.on('team-updated', (data) => {
      console.log('📢 Team updated:', data);
      fetchTeam();
      if (data.tasksAssigned > 0) {
        fetchTasks();
      }
    });

    // Listen for task updates
    newSocket.on('tasks-updated', (data) => {
      console.log('📢 Tasks updated:', data);
      fetchTasks();
    });

    // Listen for risk resolution
    newSocket.on('risk-resolved', (data) => {
      console.log('📢 Risk resolved:', data);
      fetchRisks();
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Join/leave project room when project changes
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
