'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { TaskList, TaskFilters, TaskForm, ExportButton } from '@/components/tasks';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type {
  Task,
  Category,
  User,
  TaskStatus,
  CreateTaskDto,
  UpdateTaskDto,
  ApiError,
} from '@/lib/types';

export default function TasksPage() {
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters - initialize from URL params
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // Initialize filters from URL params
  useEffect(() => {
    const assignee = searchParams.get('assignee');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (assignee) setAssigneeFilter(assignee);
    if (status) setStatusFilter(status);
    if (priority) setPriorityFilter(priority);
    if (category) setCategoryFilter(category);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  // Form state
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
      toast.error('Failed to load tasks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesCategory =
      categoryFilter === 'all' || task.categoryId === categoryFilter;
    const matchesAssignee =
      assigneeFilter === 'all' || task.assigneeId === assigneeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssignee;
  });

  const handleCreateTask = async (data: CreateTaskDto | UpdateTaskDto) => {
    setIsSubmitting(true);
    try {
      const newTask = await api.createTask(data as CreateTaskDto);
      setTasks((prev) => [newTask, ...prev]);
      setIsFormOpen(false);
      toast.success('Task created successfully');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to create task');
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
      toast.success('Task updated successfully');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      const updatedTask = await api.updateTask(id, { status });
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      toast.success('Status updated');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to update status');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast.success('Task deleted');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to delete task');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingTask(null);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setAssigneeFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            Manage and track your tasks ({filteredTasks.length} of {tasks.length})
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton tasks={filteredTasks} disabled={isLoading} />
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <TaskFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        categories={categories}
        users={users}
        onClearFilters={handleClearFilters}
      />

      <TaskList
        tasks={filteredTasks}
        isLoading={isLoading}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteTask}
        onEdit={handleEdit}
        onCreateNew={() => setIsFormOpen(true)}
      />

      <TaskForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        task={editingTask}
        categories={categories}
        users={users}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
