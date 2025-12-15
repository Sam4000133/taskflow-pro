import { useAuthStore } from '@/store/auth';
import { getApiUrl } from './env';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  Task,
  TaskStats,
  CreateTaskDto,
  UpdateTaskDto,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  Comment,
  CreateCommentDto,
  ApiError,
} from './types';

const API_URL = getApiUrl();

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return useAuthStore.getState().token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'An error occurred',
        statusCode: response.status,
      }));

      if (response.status === 401) {
        useAuthStore.getState().logout();
      }

      throw error;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // User endpoints
  async getMe(): Promise<User> {
    return this.request<User>('/users/me');
  }

  async updateMe(data: Partial<User>): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async uploadAvatar(file: File): Promise<User> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${this.baseUrl}/users/me/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'Failed to upload avatar',
        statusCode: response.status,
      }));
      throw error;
    }

    return response.json();
  }

  // Task endpoints
  async getTasks(params?: { search?: string }): Promise<Task[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) {
      searchParams.set('search', params.search);
    }
    const queryString = searchParams.toString();
    return this.request<Task[]>(`/tasks${queryString ? `?${queryString}` : ''}`);
  }

  async getTaskStats(): Promise<TaskStats> {
    return this.request<TaskStats>('/tasks/stats');
  }

  async getTask(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`);
  }

  async createTask(data: CreateTaskDto): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  async getCategory(id: string): Promise<Category> {
    return this.request<Category>(`/categories/${id}`);
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Comment endpoints
  async getComments(taskId: string): Promise<Comment[]> {
    return this.request<Comment[]>(`/tasks/${taskId}/comments`);
  }

  async createComment(taskId: string, data: CreateCommentDto): Promise<Comment> {
    return this.request<Comment>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteComment(id: string): Promise<void> {
    return this.request<void>(`/comments/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_URL);
