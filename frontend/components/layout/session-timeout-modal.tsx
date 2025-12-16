'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const WARNING_TIME = 60 * 1000; // Show warning 1 minute before expiration

export function SessionTimeoutModal() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const handleLogout = useCallback(() => {
    setShowModal(false);
    logout();
    router.push('/login');
  }, [logout, router]);

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Hide modal if showing
    setShowModal(false);
    setCountdown(60);

    if (!isAuthenticated) return;

    // Set warning timer (4 minutes)
    warningRef.current = setTimeout(() => {
      setShowModal(true);
      setCountdown(60);

      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, SESSION_TIMEOUT - WARNING_TIME);

    // Set logout timer (5 minutes)
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, SESSION_TIMEOUT);
  }, [isAuthenticated, handleLogout]);

  const handleExtendSession = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      // Only reset if modal is not showing (to prevent accidental extends)
      if (!showModal) {
        const now = Date.now();
        // Throttle resets to every 30 seconds to avoid excessive timer resets
        if (now - lastActivityRef.current > 30000) {
          resetTimers();
        }
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize timers
    resetTimers();

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isAuthenticated, resetTimers, showModal]);

  // Auto logout when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && showModal) {
      handleLogout();
    }
  }, [countdown, showModal, handleLogout]);

  if (!isAuthenticated) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={showModal} onOpenChange={(open) => {
      if (!open) {
        // User clicked X or outside - extend session
        handleExtendSession();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Expiring</DialogTitle>
          <DialogDescription>
            Your session will expire due to inactivity. Do you want to continue?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          <div className="text-5xl font-bold tabular-nums text-destructive">
            {formatTime(countdown)}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Time remaining before automatic logout
          </p>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleLogout}>
            Logout Now
          </Button>
          <Button onClick={handleExtendSession}>
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
