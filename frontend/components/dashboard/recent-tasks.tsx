'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import type { Task } from '@/lib/types';

interface RecentTasksProps {
  tasks: Task[];
  isLoading?: boolean;
}

export function RecentTasks({ tasks, isLoading }: RecentTasksProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TODO':
        return <Badge variant="secondary">To Do</Badge>;
      case 'IN_PROGRESS':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            In Progress
          </Badge>
        );
      case 'DONE':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Done
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="destructive">High</Badge>;
      case 'MEDIUM':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Medium
          </Badge>
        );
      case 'LOW':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getDueDateDisplay = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const isOverdue = isPast(date) && !isToday(date);

    return (
      <span
        className={`flex items-center gap-1 text-xs ${
          isOverdue ? 'text-red-600' : 'text-muted-foreground'
        }`}
      >
        <Calendar className="h-3 w-3" />
        {format(date, 'MMM d')}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Tasks</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tasks" className="flex items-center gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No tasks yet</p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/tasks">Create your first task</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate font-medium">{task.title}</p>
                  <div className="flex items-center gap-3">
                    {task.description && (
                      <p className="truncate text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                    {getDueDateDisplay(task.dueDate)}
                  </div>
                </div>
                <div className="ml-4 flex flex-shrink-0 items-center gap-2">
                  {getPriorityBadge(task.priority)}
                  {getStatusBadge(task.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
