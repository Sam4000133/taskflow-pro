# TaskFlow Pro

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![Mobile](https://img.shields.io/badge/Mobile-Ready-34A853)

A full-stack task management system with modern architecture, featuring real-time dashboard analytics, task assignment, commenting system, and category management.

## Features

- **User Authentication**: JWT-based auth with secure password hashing
- **Role-Based Access Control**: Admin and User roles with different permissions
- **Task Management**: Full CRUD operations with status tracking (TODO, IN_PROGRESS, DONE)
- **Kanban Board**: Drag & drop interface for visual task management
- **Dashboard Analytics**: Real-time statistics with charts (Recharts)
- **Global Search**: Command palette (Cmd/Ctrl+K) for quick navigation
- **Dark Mode**: System-aware theme toggle with manual override
- **Export**: Download tasks as CSV or PDF
- **Real-time Notifications**: WebSocket-powered live updates
- **Avatar Upload**: Custom profile picture support
- **Categories**: Organize tasks with color-coded categories
- **Comments**: Collaborative task discussion
- **Responsive Design**: Desktop-first with mobile support
- **Health Monitoring**: Comprehensive health check endpoint

## Role-Based Access Control

TaskFlow Pro implements role-based access control with two user types:

### Admin Users
- View all tasks in the system
- Create tasks and assign them to any user
- Edit and delete any task
- Access all filters including assignee filter
- Full dashboard statistics for all tasks

### Regular Users
- View only tasks they created or are assigned to
- Create tasks (automatically assigned to themselves)
- Edit only their own tasks
- Cannot assign tasks to other users
- Dashboard statistics only for their tasks

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 16, React 19.2, TypeScript, shadcn/ui, TailwindCSS, Recharts, Zustand |
| **Backend** | Nest.js 11, TypeScript, Prisma ORM 7, class-validator |
| **Database** | PostgreSQL 17 |
| **Auth** | JWT, bcrypt |
| **DevOps** | Docker, Docker Compose |
| **Deployment** | Vercel (frontend), Render.io (backend) |

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/Sam4000133/taskflow-pro.git
cd taskflow-pro

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3002
# Backend: http://localhost:3001
# pgAdmin: http://localhost:5056
```

### Option 2: Manual Setup

#### 1. Start Database

```bash
docker-compose up -d postgres pgadmin
```

#### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

Backend runs on http://localhost:3001

#### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on http://localhost:3000

## Project Structure

```
taskflow-pro/
├── docker-compose.yml        # Development containers
├── render.yaml               # Render.io deployment config
├── README.md
├── CLAUDE.md                 # Development guidelines
│
├── backend/                  # Nest.js API
│   ├── src/
│   │   ├── auth/             # JWT authentication
│   │   ├── tasks/            # Task CRUD + stats
│   │   ├── users/            # User management
│   │   ├── categories/       # Category management
│   │   ├── comments/         # Task comments
│   │   ├── prisma/           # Database service
│   │   ├── config/           # Environment validation
│   │   ├── app.controller.ts # Health check endpoint
│   │   └── main.ts           # Application entry
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Demo data
│   ├── Dockerfile            # Multi-stage build
│   └── .env.example
│
└── frontend/                 # Next.js Application
    ├── app/
    │   ├── (auth)/           # Login/Register pages
    │   └── (dashboard)/      # Protected pages
    │       ├── dashboard/    # Analytics dashboard
    │       ├── tasks/        # Task management
    │       ├── categories/   # Category management
    │       └── settings/     # User settings
    ├── components/
    │   ├── ui/               # shadcn/ui components
    │   ├── dashboard/        # Dashboard widgets
    │   ├── tasks/            # Task components
    │   ├── categories/       # Category components
    │   └── layout/           # Sidebar, Header
    ├── lib/                  # API client, utilities
    ├── store/                # Zustand state
    ├── Dockerfile            # Multi-stage build
    ├── vercel.json           # Vercel deployment
    └── .env.example
```

## API Documentation

### Base URL
- Development: `http://localhost:3001`
- Production: Your deployed backend URL

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "access_token": "jwt_token"
}
```

### Tasks

All task endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List all tasks |
| GET | `/tasks/stats` | Get task statistics |
| GET | `/tasks/:id` | Get task with comments |
| POST | `/tasks` | Create task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

#### Create Task
```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Task title",
  "description": "Task description",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2024-12-31T00:00:00Z",
  "assigneeId": "user-uuid",
  "categoryId": "category-uuid"
}
```

#### Task Statistics Response
```json
{
  "total": 10,
  "todo": 4,
  "inProgress": 3,
  "done": 3,
  "overdue": 1
}
```

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all categories |
| POST | `/categories` | Create category |
| PATCH | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks/:taskId/comments` | Add comment |
| DELETE | `/comments/:id` | Delete comment |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user |
| PATCH | `/users/me` | Update profile |
| GET | `/users` | List all users |

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-12-15T12:00:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 5
    },
    "memory": {
      "used": 50,
      "total": 100,
      "percentage": 50
    }
  },
  "environment": "production"
}
```

## Database Schema

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │     │   tasks     │     │  categories │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │◄────│ creatorId   │     │ id          │
│ email       │◄────│ assigneeId  │────►│ name        │
│ password    │     │ categoryId  │     │ color       │
│ name        │     │ title       │     └─────────────┘
│ role        │     │ description │
│ avatar      │     │ status      │     ┌─────────────┐
│ createdAt   │     │ priority    │     │  comments   │
│ updatedAt   │     │ dueDate     │     ├─────────────┤
└─────────────┘     │ createdAt   │◄────│ taskId      │
                    │ updatedAt   │     │ authorId    │────►
                    └─────────────┘     │ content     │
                                        │ createdAt   │
                                        └─────────────┘
```

## Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes |
| `JWT_EXPIRES_IN` | Token expiration (default: 7d) | No |
| `PORT` | Server port (default: 3001) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `FRONTEND_URL` | CORS allowed origin | No |

### Frontend (.env.local)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
4. Deploy

### Backend (Render.io)

1. Push your code to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect to your repository
4. Use the `render.yaml` blueprint or configure manually:
   - **Build Command**: `npm ci && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && node dist/main.js`
5. Add environment variables:
   - `DATABASE_URL`: From Render PostgreSQL
   - `JWT_SECRET`: Generate secure value
   - `FRONTEND_URL`: Your Vercel URL

### Database (Render PostgreSQL)

1. Create PostgreSQL instance on Render
2. Copy the connection string to `DATABASE_URL`

## Available Services (Development)

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3002 | Next.js application |
| Backend | http://localhost:3001 | Nest.js API |
| PostgreSQL | localhost:5436 | Database |
| pgAdmin | http://localhost:5056 | Database UI |
| Prisma Studio | http://localhost:5555 | ORM UI |

## Demo Credentials

After seeding the database, you can login with any of these accounts:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Sarah Mitchell | admin@taskflow.com | password123 | Admin |
| Alex Thompson | dev@test.com | password123 | User |
| Emma Rodriguez | designer@taskflow.com | password123 | User |
| Michael Chen | pm@taskflow.com | password123 | Admin |
| David Kim | qa@taskflow.com | password123 | User |

## Common Commands

### Backend
```bash
npm run start:dev          # Development server (watch mode)
npm run build              # Production build
npm run start:prod         # Start production server
npx prisma studio          # Database browser
npx prisma migrate dev     # Create migration
npx prisma db seed         # Seed demo data
npx prisma migrate reset   # Reset database
```

### Frontend
```bash
npm run dev                # Development server (Turbopack)
npm run build              # Production build
npm run start              # Start production server
npm run lint               # Run ESLint
npx shadcn@latest add      # Add UI component
```

### Docker
```bash
docker-compose up -d       # Start all containers
docker-compose down        # Stop containers
docker-compose logs -f     # Follow logs
docker-compose restart     # Restart containers
docker-compose ps          # List running containers
```

## Testing

### API Testing (curl)

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@taskflow.com","password":"password123"}'

# Get tasks (with token)
curl http://localhost:3001/tasks \
  -H "Authorization: Bearer <your_token>"
```

## Troubleshooting

### Database connection issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Frontend build errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Backend TypeScript errors
```bash
# Regenerate Prisma client
npx prisma generate

# Clean and rebuild
rm -rf dist
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with Next.js 16, Nest.js 11, and PostgreSQL 17.
