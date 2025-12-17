'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryManager } from '@/components/categories';
import { AvatarUpload } from '@/components/settings';
import { toast } from 'sonner';
import { User, Palette, Shield } from 'lucide-react';
import type { Category, CreateCategoryDto, UpdateCategoryDto, ApiError } from '@/lib/types';

export default function SettingsPage() {
  const { user, setAuth, token } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await api.updateMe({ name });
      if (token) {
        setAuth(updated, token);
      }
      toast.success('Profile updated successfully');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateCategory = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    try {
      const newCategory = await api.createCategory(data as CreateCategoryDto);
      setCategories((prev) => [...prev, newCategory]);
      toast.success('Category created');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to create category');
      throw err;
    }
  };

  const handleUpdateCategory = async (id: string, data: UpdateCategoryDto) => {
    try {
      const updatedCategory = await api.updateCategory(id, data);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
      toast.success('Category updated');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to update category');
      throw err;
    }
  };

  const handleDeleteCategory = async (id: string) => {
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
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              <AvatarUpload />
              <div className="flex-1 pt-4">
                <p className="font-medium text-lg">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {user?.role}
                </Badge>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={isUpdating || name === user?.name}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Info Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>View your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b py-3">
              <span className="text-muted-foreground">Account ID</span>
              <span className="font-mono text-sm">{user?.id?.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between border-b py-3">
              <span className="text-muted-foreground">Role</span>
              <Badge variant={user?.role === 'ADMIN' ? 'default' : 'secondary'}>
                {user?.role}
              </Badge>
            </div>
            <div className="flex justify-between border-b py-3">
              <span className="text-muted-foreground">Member Since</span>
              <span>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-muted-foreground">Status</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Section */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Task Categories</h3>
        </div>
        <div className="max-w-2xl">
          <CategoryManager
            categories={categories}
            isLoading={isCategoriesLoading}
            onCreate={handleCreateCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
          />
        </div>
      </div>
    </div>
  );
}
