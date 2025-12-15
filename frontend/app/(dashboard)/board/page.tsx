'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { KanbanBoard } from '@/components/kanban';
import { TaskForm } from '@/components/tasks';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { Task, Category, User, CreateTaskDto, UpdateTaskDto, ApiError } from '@/lib/types';

export default function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [tasksData, categoriesData, usersData] = await Promise.all([
        api.getTasks(),
        api.getCategories(),
        api.getUsers(),
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
      setUsers(usersData);
    } catch (err) {
      toast.error('Failed to load data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      await api.updateTask(taskId, { status: newStatus as Task['status'] });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus as Task['status'] } : task
        )
      );
      toast.success('Task moved');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to move task');
      throw err;
    }
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCreateTask = async (data: CreateTaskDto | UpdateTaskDto) => {
    setIsSubmitting(true);
    try {
      const newTask = await api.createTask(data as CreateTaskDto);
      setTasks((prev) => [...prev, newTask]);
      setIsFormOpen(false);
      toast.success('Task created');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to create task');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (data: CreateTaskDto | UpdateTaskDto) => {
    if (!editingTask) return;
    setIsSubmitting(true);
    try {
      const updatedTask = await api.updateTask(editingTask.id, data);
      setTasks((prev) =>
        prev.map((task) => (task.id === editingTask.id ? updatedTask : task))
      );
      setIsFormOpen(false);
      setEditingTask(null);
      toast.success('Task updated');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to update task');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[500px] w-80 flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kanban Board</h2>
          <p className="text-muted-foreground">
            Drag and drop tasks between columns to update their status
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <KanbanBoard
        tasks={tasks}
        onTaskMove={handleTaskMove}
        onTaskClick={handleTaskClick}
      />

      <TaskForm
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseForm();
          else setIsFormOpen(open);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        categories={categories}
        users={users}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
