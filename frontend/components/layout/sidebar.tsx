'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckSquare,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  Kanban,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Board', href: '/board', icon: Kanban },
  { name: 'Categories', href: '/categories', icon: FolderOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  return (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={onLinkClick}
        >
          <CheckSquare className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">TaskFlow</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={() => {
            logout();
            onLinkClick?.();
          }}
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </Button>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-background md:flex">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          <SidebarContent onLinkClick={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
