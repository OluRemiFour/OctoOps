'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  deadline: string;
  status: string;
  timerStartedAt?: string | Date;
}

export default function CountdownTimer({ deadline, status, timerStartedAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgency, setUrgency] = useState<'safe' | 'warning' | 'critical'>('safe');

  useEffect(() => {
    if ((!deadline && !timerStartedAt) || status === 'done') return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      let target;

      if (status === 'in-progress' && timerStartedAt) {
        // Persistent Mission Window (4h)
        const startTime = new Date(timerStartedAt).getTime();
        target = startTime + (4 * 60 * 60 * 1000) + (1 * 60 * 1000); // 4h + 1m buffer for skew
      } else {
        // Project Deadline
        target = new Date(deadline).getTime();
      }

      const diff = target - now;
      const displayDiff = diff < 0 ? 0 : diff;

      if (displayDiff === 0 && status !== 'done') {
        setTimeLeft(status === 'in-progress' ? 'Mission Timeout' : 'Overdue');
        setUrgency('critical');
        return;
      }

      const days = Math.floor(displayDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((displayDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((displayDiff % (1000 * 60 * 60)) / (1000 * 60));

      // Determine urgency
      if (days === 0 && hours < 6) {
        setUrgency('critical');
      } else if (days === 0 || (days === 1 && hours < 12)) {
        setUrgency('warning');
      } else {
        setUrgency('safe');
      }

      // Format display
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline, status, timerStartedAt]);

  if (status === 'done') return null;
  if (!deadline && !timerStartedAt) return null;

  const colors = {
    safe: 'text-[#00FF88] border-[#00FF88]/30 bg-[#00FF88]/10',
    warning: 'text-[#FFB800] border-[#FFB800]/30 bg-[#FFB800]/10',
    critical: 'text-[#FF3366] border-[#FF3366]/30 bg-[#FF3366]/10 animate-pulse'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-bold ${colors[urgency]}`}>
      {urgency === 'critical' ? (
        <AlertTriangle className="w-3 h-3" />
      ) : (
        <Clock className="w-3 h-3" />
      )}
      {timeLeft}
    </div>
  );
}
