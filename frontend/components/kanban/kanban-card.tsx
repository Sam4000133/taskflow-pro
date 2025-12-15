'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MessageSquare, GripVertical } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  task: Task;
  onClick?: () => void;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  const assigneeInitials = task.assignee?.name
    ? task.assignee.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg rotate-2'
      )}
      onClick={onClick}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start gap-2">
          <button
            className="mt-0.5 cursor-grab touch-none text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
          {task.category && (
            <Badge
              variant="outline"
              style={{
                backgroundColor: `${task.category.color}20`,
                borderColor: task.category.color,
                color: task.category.color,
              }}
            >
              {task.category.name}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.dueDate && (
              <div
                className={cn(
                  'flex items-center gap-1',
                  isOverdue && 'text-red-500',
                  isDueToday && 'text-orange-500'
                )}
              >
                <Calendar className="h-3 w-3" />
                {format(new Date(task.dueDate), 'MMM d')}
              </div>
            )}
            {(task._count?.comments ?? 0) > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {task._count?.comments}
              </div>
            )}
          </div>

          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar || undefined} />
              <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                {assigneeInitials}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
