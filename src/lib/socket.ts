import { io } from 'socket.io-client';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000' || 'https://octo-ops-backend.onrender.com';
export const socket = io(API_URL.replace('/api', ''), {
  withCredentials: true,
  autoConnect: true
});
