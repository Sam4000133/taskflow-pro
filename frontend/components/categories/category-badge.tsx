'use client';

import { Badge } from '@/components/ui/badge';
import type { Category } from '@/lib/types';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'default' | 'lg';
}

export function CategoryBadge({ category, size = 'default' }: CategoryBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <Badge
      style={{ backgroundColor: category.color }}
      className={`text-white ${sizeClasses[size]}`}
    >
      {category.name}
    </Badge>
  );
}
