'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, User, FolderOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useDebounce } from '@/hooks/use-debounce';
import type { Task, Category, User as UserType } from '@/lib/types';

interface SearchResults {
  tasks: Task[];
  categories: Category[];
  users: UserType[];
}

const statusColors: Record<string, string> = {
  TODO: 'bg-slate-500',
  IN_PROGRESS: 'bg-blue-500',
  DONE: 'bg-green-500',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-400',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
};

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    tasks: [],
    categories: [],
    users: [],
  });

  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ tasks: [], categories: [], users: [] });
      return;
    }

    setIsLoading(true);
    try {
      const [tasks, categories, users] = await Promise.all([
        api.getTasks({ search: searchQuery }),
        api.getCategories(),
        api.getUsers(),
      ]);

      // Filter categories and users by name
      const searchLower = searchQuery.toLowerCase();
      const filteredCategories = categories.filter((c: Category) =>
        c.name.toLowerCase().includes(searchLower)
      );
      const filteredUsers = users.filter((u: UserType) =>
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      );

      setResults({
        tasks: tasks.slice(0, 5),
        categories: filteredCategories.slice(0, 3),
        users: filteredUsers.slice(0, 3),
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (type: string, id: string, name?: string) => {
    setOpen(false);
    setQuery('');
    switch (type) {
      case 'task':
        router.push(`/tasks?search=${encodeURIComponent(name || '')}`);
        break;
      case 'category':
        router.push(`/tasks?category=${id}`);
        break;
      case 'user':
        router.push(`/tasks?assignee=${id}`);
        break;
    }
  };

  const totalResults =
    results.tasks.length + results.categories.length + results.users.length;

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search...
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search tasks, categories, users..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {totalResults === 0 && query && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}

              {!query && (
                <CommandEmpty>Type to search tasks, categories, or users...</CommandEmpty>
              )}

              {results.tasks.length > 0 && (
                <CommandGroup heading="Tasks">
                  {results.tasks.map((task) => (
                    <CommandItem
                      key={task.id}
                      value={task.title}
                      onSelect={() => handleSelect('task', task.id, task.title)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-1 flex-col">
                        <span className="font-medium">{task.title}</span>
                        {task.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {task.description}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Badge
                          variant="secondary"
                          className={`${statusColors[task.status]} text-white text-xs`}
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`${priorityColors[task.priority]} text-white text-xs`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.categories.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Categories">
                    {results.categories.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={category.name}
                        onSelect={() => handleSelect('category', category.id)}
                        className="flex items-center gap-2"
                      >
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1">{category.name}</span>
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {results.users.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Users">
                    {results.users.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.name}
                        onSelect={() => handleSelect('user', user.id)}
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-1 flex-col">
                          <span>{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                        <Badge variant="outline">{user.role}</Badge>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
