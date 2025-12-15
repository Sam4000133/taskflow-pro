'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import type { TaskStats } from '@/lib/types';

interface DashboardStatsProps {
  stats: TaskStats | null;
  isLoading?: boolean;
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Tasks',
      value: stats?.total || 0,
      icon: ListTodo,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'To Do',
      value: stats?.todo || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'In Progress',
      value: stats?.inProgress || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Completed',
      value: stats?.done || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Overdue',
      value: stats?.overdue || 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statCards.map((stat) => (
        <Card key={stat.title} className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-full p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
