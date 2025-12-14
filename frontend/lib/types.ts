// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  avatar: string | null;
  createdAt: string;
  updatedAt?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

// Task types
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  assigneeId: string | null;
  categoryId: string | null;
  creator?: User;
  assignee?: User | null;
  category?: Category | null;
  comments?: Comment[];
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  categoryId?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

// Category types
export interface Category {
  id: string;
  name: string;
  color: string;
  _count?: {
    tasks: number;
  };
}

export interface CreateCategoryDto {
  name: string;
  color: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

// Comment types
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  taskId: string;
  authorId: string;
  author?: User;
}

export interface CreateCommentDto {
  content: string;
}

// API Error
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
