'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KanbanCard } from './kanban-card';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  onTaskClick?: (task: Task) => void;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  color,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Card
      className={cn(
        'flex h-full min-h-[500px] min-w-72 flex-1 flex-col transition-colors',
        isOver && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 space-y-2"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground">
            Drop tasks here
          </div>
        )}
      </CardContent>
    </Card>
  );
}
