'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import type { Task } from '@/lib/types';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: string) => Promise<void>;
  onTaskClick?: (task: Task) => void;
}

const columns = [
  { id: 'TODO', title: 'To Do', color: '#eab308' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#8b5cf6' },
  { id: 'DONE', title: 'Done', color: '#22c55e' },
];

export function KanbanBoard({ tasks, onTaskMove, onTaskClick }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // Update local tasks when props change
  if (JSON.stringify(tasks) !== JSON.stringify(localTasks)) {
    setLocalTasks(tasks);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByStatus = useCallback(
    (status: string) => {
      return localTasks.filter((task) => task.status === status);
    },
    [localTasks]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = localTasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = localTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if over is a column
    const isOverColumn = columns.some((col) => col.id === overId);

    if (isOverColumn && activeTask.status !== overId) {
      // Moving to a different column
      setLocalTasks((prev) =>
        prev.map((task) =>
          task.id === activeId ? { ...task, status: overId } : task
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = localTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropped on a column
    const targetColumn = columns.find((col) => col.id === overId);
    const newStatus = targetColumn?.id || overId;

    // Find the original task to check if status changed
    const originalTask = tasks.find((t) => t.id === activeId);
    if (originalTask && originalTask.status !== newStatus) {
      try {
        await onTaskMove(activeId, newStatus);
      } catch (error) {
        // Revert on error
        setLocalTasks(tasks);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            tasks={getTasksByStatus(column.id)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 opacity-90">
            <KanbanCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
