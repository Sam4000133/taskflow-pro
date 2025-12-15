'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskItem } from './task-item';
import { ListTodo } from 'lucide-react';
import type { Task, TaskStatus } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (task: Task) => void;
  onCreateNew: () => void;
}

export function TaskList({
  tasks,
  isLoading,
  onStatusChange,
  onDelete,
  onEdit,
  onCreateNew,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ListTodo className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
          <p className="mt-2 text-center text-muted-foreground">
            Get started by creating your first task
          </p>
          <Button onClick={onCreateNew} className="mt-4">
            Create Task
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
