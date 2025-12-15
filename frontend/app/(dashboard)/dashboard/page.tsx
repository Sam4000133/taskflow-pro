'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardStats, RecentTasks, TaskActivityChart } from '@/components/dashboard';
import type { TaskStats, Task } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, tasksData] = await Promise.all([
          api.getTaskStats(),
          api.getTasks(),
        ]);
        setStats(statsData);
        setRecentTasks(tasksData.slice(0, 5));
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your tasks.
        </p>
      </div>

      <DashboardStats stats={stats} isLoading={isLoading} />

      <TaskActivityChart stats={stats} isLoading={isLoading} />

      <RecentTasks tasks={recentTasks} isLoading={isLoading} />
    </div>
  );
}
