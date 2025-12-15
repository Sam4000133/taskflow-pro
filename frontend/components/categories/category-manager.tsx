'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CategoryBadge } from './category-badge';
import { CategoryForm } from './category-form';
import { Edit, Trash2, Plus, FolderOpen } from 'lucide-react';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/lib/types';

interface CategoryManagerProps {
  categories: Category[];
  isLoading: boolean;
  onCreate: (data: CreateCategoryDto) => Promise<void>;
  onUpdate: (id: string, data: UpdateCategoryDto) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CategoryManager({
  categories,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
}: CategoryManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = async (data: CreateCategoryDto) => {
    setIsSubmitting(true);
    try {
      await onCreate(data);
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: UpdateCategoryDto) => {
    if (!editingCategory) return;
    setIsSubmitting(true);
    try {
      await onUpdate(editingCategory.id, data);
      setIsFormOpen(false);
      setEditingCategory(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      await onDelete(deletingCategory.id);
      setDeletingCategory(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingCategory(null);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categories</CardTitle>
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No categories yet</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => setIsFormOpen(true)}
              >
                Create your first category
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <CategoryBadge category={category} />
                    {category._count && (
                      <span className="text-sm text-muted-foreground">
                        {category._count.tasks} task
                        {category._count.tasks !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingCategory(category)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        category={editingCategory}
        onSubmit={editingCategory ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
      />

      <Dialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category &quot;
              {deletingCategory?.name}&quot;? Tasks in this category will be
              uncategorized.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingCategory(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
