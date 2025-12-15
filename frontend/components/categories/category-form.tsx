'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/lib/types';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const DEFAULT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
];

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
  isSubmitting: boolean;
}

export function CategoryForm({
  open,
  onOpenChange,
  category,
  onSubmit,
  isSubmitting,
}: CategoryFormProps) {
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      color: DEFAULT_COLORS[0],
    },
  });

  const watchedColor = watch('color');

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        color: category.color,
      });
    } else {
      reset({
        name: '',
        color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
      });
    }
  }, [category, reset]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the category details below'
              : 'Create a new category to organize your tasks'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter category name"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      watchedColor === color
                        ? 'border-foreground ring-2 ring-offset-2'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setValue('color', color)}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Label htmlFor="customColor" className="text-sm">
                  Custom:
                </Label>
                <Input
                  id="customColor"
                  type="color"
                  {...register('color')}
                  className="h-8 w-16 cursor-pointer p-1"
                />
                <span className="text-sm text-muted-foreground">{watchedColor}</span>
              </div>
              {errors.color && (
                <p className="text-sm text-red-600">{errors.color.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">Preview:</span>
              <div
                className="rounded-full px-3 py-1 text-sm text-white"
                style={{ backgroundColor: watchedColor }}
              >
                {watch('name') || 'Category Name'}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? 'Saving...'
                  : 'Creating...'
                : isEditing
                ? 'Save Changes'
                : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
