'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AvatarUploadProps {
  className?: string;
}

export function AvatarUpload({ className }: AvatarUploadProps) {
  const { user, setAuth, token } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const getAvatarUrl = (avatarPath: string | null | undefined) => {
    if (!avatarPath) return undefined;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${API_URL}${avatarPath}`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      toast.error('Please select a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const updatedUser = await api.uploadAvatar(file);
      if (token) {
        setAuth(updatedUser, token);
      }
      toast.success('Avatar updated successfully');
      setPreview(null);
    } catch (error) {
      toast.error('Failed to upload avatar');
      setPreview(null);
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const cancelPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative group">
        <Avatar className="h-24 w-24 cursor-pointer" onClick={handleClick}>
          <AvatarImage
            src={preview || getAvatarUrl(user?.avatar)}
            alt={user?.name}
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Overlay */}
        <div
          className={cn(
            'absolute inset-0 rounded-full flex items-center justify-center transition-opacity cursor-pointer',
            isUploading
              ? 'bg-black/50 opacity-100'
              : 'bg-black/40 opacity-0 group-hover:opacity-100'
          )}
          onClick={handleClick}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          ) : (
            <Camera className="h-8 w-8 text-white" />
          )}
        </div>

        {/* Cancel preview button */}
        {preview && !isUploading && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              cancelPreview();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />

      <p className="text-sm text-muted-foreground text-center">
        Click to upload a new avatar
        <br />
        <span className="text-xs">JPG, PNG, GIF or WebP. Max 5MB.</span>
      </p>
    </div>
  );
}
