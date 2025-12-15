'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { CategoryManager } from '@/components/categories';
import { toast } from 'sonner';
import type { Category, CreateCategoryDto, UpdateCategoryDto, ApiError } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (data: CreateCategoryDto) => {
    try {
      const newCategory = await api.createCategory(data);
      setCategories((prev) => [...prev, newCategory]);
      toast.success('Category created successfully');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to create category');
      throw err;
    }
  };

  const handleUpdate = async (id: string, data: UpdateCategoryDto) => {
    try {
      const updatedCategory = await api.updateCategory(id, data);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
      toast.success('Category updated successfully');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to update category');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      toast.success('Category deleted');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to delete category');
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
        <p className="text-muted-foreground">
          Manage task categories to organize your work
        </p>
      </div>

      <div className="max-w-2xl">
        <CategoryManager
          categories={categories}
          isLoading={isLoading}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
