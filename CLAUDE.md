# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## CRITICAL INSTRUCTIONS - READ FIRST

### Language & Code Style
- **ALL code must be in ENGLISH**: variables, functions, classes, comments, documentation
- **Commit messages**: English only, use Conventional Commits format
- **Comments**: English only, clear and concise
- **API responses**: English only
- **Database naming**: English (snake_case for tables/columns)

### Git Workflow
- **Commits**: Frequent commits for each logical change
- **Commit format**: `<type>: <description>` (e.g., `feat: add user authentication`)
- **Types**: feat, fix, docs, style, refactor, test, chore
- **Push**: At end of day or when module is complete (not every single commit)
- **Co-author**: DO NOT add co-author tags - all commits are under the developer's name ONLY
- **Author**: Commits should only show the developer as author, never "Co-authored-by: Claude" or similar

### Responsive Design Strategy
- **Approach**: Desktop-first development (optimize for 1280px+ screens)
- **Mobile**: Acceptable responsive behavior, not pixel-perfect
- **Breakpoints**: Focus on desktop (1280px+), tablet (768-1279px), mobile (< 768px)
- **Priority**: Functionality over responsive perfection - this is a portfolio demo
- **Media queries**: Use `max-width` for desktop-first approach
- **Testing**: Primary testing on desktop, secondary validation on mobile

### Code Quality
- **TypeScript**: Strict mode, no `any` unless absolutely necessary
- **Error handling**: Always use try-catch with meaningful error messages
- **Validation**: Validate all inputs (DTOs for backend, Zod for frontend)
- **Security**: Never log passwords, tokens, or sensitive data
- **Comments**: Only for complex logic - code should be self-documenting

---

## Project Overview

**TaskFlow Pro** - Full-stack task management system with modern architecture.

### Tech Stack
- **Frontend**: Next.js 16 (latest stable), React 19.2, TypeScript, shadcn/ui, TailwindCSS, Recharts
- **Turbopack**: Stable bundler (default in Next.js 16) - 5-10x faster Fast Refresh
- **Backend**: Nest.js 10, TypeScript, Prisma ORM 6, PostgreSQL
- **Auth**: JWT-based authentication with bcrypt password hashing
- **Deployment**: Vercel (frontend), Render.io (backend + PostgreSQL)

### Project Structure
```
taskflow-pro/
├── docker-compose.yml    # PostgreSQL + pgAdmin containers
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── README.md            # Project documentation
├── CLAUDE.md            # This file
│
├── backend/              # Nest.js API server
│   ├── src/
│   │   ├── auth/         # Authentication module (JWT, login, register)
│   │   ├── tasks/        # Tasks CRUD operations
│   │   ├── users/        # User management
│   │   ├── categories/   # Task categories
│   │   ├── comments/     # Task comments
│   │   ├── prisma/       # Prisma service wrapper
│   │   └── main.ts       # App entry point with CORS
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── seed.ts       # Demo data seeding
│   ├── .env              # Backend environment variables
│   └── package.json
│
└── frontend/             # Next.js web application
    ├── app/
    │   ├── (auth)/       # Login/Register pages (public)
    │   └── (dashboard)/  # Protected dashboard pages
    ├── components/
    │   ├── ui/           # shadcn/ui components
    │   ├── dashboard/    # Dashboard-specific components
    │   ├── tasks/        # Task-related components
    │   └── layout/       # Sidebar, Header, etc.
    ├── lib/              # API client, utilities
    ├── store/            # State management (Zustand)
    ├── .env.local        # Frontend environment variables
    └── package.json
```

---

## Initial Setup

### Frontend Setup (Next.js 16)
```bash
cd frontend

# Create Next.js app with Turbopack (stable, default bundler)
npx create-next-app@latest . --typescript --tailwind --app --turbo --no-src-dir
# Prompts: Yes to ESLint, Yes to Turbopack, No to src/ directory, Yes to App Router

# Initialize shadcn/ui
npx shadcn@latest init
# Choose: New York style, Slate color, CSS variables

# Install additional dependencies
npm install recharts date-fns zustand zod react-hook-form @hookform/resolvers

# Install required shadcn components
npx shadcn@latest add button card form input label select table toast
npx shadcn@latest add dialog dropdown-menu badge avatar calendar
npx shadcn@latest add popover textarea

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start dev server
npm run dev
# Running on http://localhost:3000 with Turbopack
```

---

## Build & Development Commands

### Backend (Nest.js)

**Daily Development:**
```bash
cd backend
npm run start:dev    # Hot-reload dev server on http://localhost:3001
```

**Database Management:**
```bash
# Visual database browser (RECOMMENDED)
npx prisma studio    # Opens http://localhost:5555

# After schema changes
npx prisma migrate dev --name <description>  # Create migration
npx prisma generate                          # Regenerate Prisma Client

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Re-seed demo data
npx prisma db seed
```

**Production Build:**
```bash
npm run build        # Build for production
npm run start:prod   # Start production server
```

### Frontend (Next.js 16)

**Daily Development:**
```bash
cd frontend
npm run dev          # Dev server on http://localhost:3000 (Turbopack enabled by default)
```

> **Note**: Turbopack is now stable and the default bundler in Next.js 16. Provides 5-10x faster Fast Refresh compared to Webpack.

**Adding Components:**
```bash
# Add shadcn component
npx shadcn@latest add <component-name>
# Example: npx shadcn@latest add toast
```

**Production Build:**
```bash
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Docker (Database)

```bash
# From project root
docker-compose up -d           # Start containers (detached)
docker-compose down            # Stop containers
docker-compose down -v         # Stop and remove volumes (deletes data!)
docker-compose logs postgres   # View PostgreSQL logs
docker-compose logs -f postgres # Follow logs (real-time)
docker-compose restart postgres # Restart PostgreSQL
docker-compose ps              # List running containers
```

---

## Architecture

### Backend Architecture

**Module Structure:**
- **auth**: Registration, login, JWT generation/validation
- **tasks**: CRUD operations with filtering, sorting, stats
- **users**: User profile and management
- **categories**: Task category management
- **comments**: Task comments system
- **prisma**: Database service wrapper (singleton)

**Key Design Patterns:**
- **DTOs (Data Transfer Objects)**: Validate requests with `class-validator`
- **Guards**: `JwtAuthGuard` protects all routes except auth endpoints
- **Services**: Business logic separated from controllers
- **Prisma ORM 6**: Type-safe database queries with auto-generated client

**Authentication Flow:**
1. POST `/auth/register` or `/auth/login` with credentials
2. Backend validates, hashes password (bcrypt, 10 rounds)
3. JWT generated with payload: `{ sub: userId, email }`, expires in 7 days
4. Token returned to client
5. Client stores token in localStorage
6. Client includes header: `Authorization: Bearer <token>`
7. `JwtAuthGuard` validates token on protected routes
8. User object injected into `req.user` for access in controllers

**Database Schema:**
- **users**: id, email, password, name, role, avatar, createdAt, updatedAt
- **tasks**: id, title, description, status, priority, dueDate, creatorId, assigneeId, categoryId
- **categories**: id, name, color
- **comments**: id, content, taskId, authorId, createdAt

**Relations:**
- User 1:N Tasks (as creator)
- User 1:N Tasks (as assignee)
- Category 1:N Tasks
- Task 1:N Comments
- User 1:N Comments

### Frontend Architecture

**Routing Structure (App Router):**
```
/                       → Landing page or redirect to /dashboard
/(auth)/login          → Public login page
/(auth)/register       → Public registration page
/(dashboard)/dashboard → Stats cards, recent tasks, activity chart (protected)
/(dashboard)/tasks     → Task list with search/filters (protected)
/(dashboard)/settings  → User profile, categories management (protected)
```

**State Management:**
- **Auth**: Zustand store for user session and JWT token
- **Tasks**: Fetched on-demand from API, local state for UI interactions
- **Forms**: React Hook Form + Zod validation

**API Communication:**
- `lib/api.ts`: Fetch wrapper with automatic auth header injection
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (http://localhost:3001 in dev)
- Error handling: 401 → auto logout, 4xx/5xx → toast notification

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://taskflow_user:taskflow_pass@localhost:5432/taskflow_db"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## API Endpoints Reference

### Authentication (Public)
- `POST /auth/register` - Body: { email, password, name } → { user, access_token }
- `POST /auth/login` - Body: { email, password } → { user, access_token }

### Tasks (Protected)
- `GET /tasks` - List all tasks
- `GET /tasks/stats` - { total, todo, inProgress, done, overdue }
- `GET /tasks/:id` - Get task with comments
- `POST /tasks` - Create task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Categories (Protected)
- `GET /categories` - List all categories
- `POST /categories` - Create category
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Users (Protected)
- `GET /users/me` - Current user profile
- `PATCH /users/me` - Update profile

### Comments (Protected)
- `POST /tasks/:taskId/comments` - Add comment
- `DELETE /comments/:id` - Delete comment

**Authentication Header:** `Authorization: Bearer <jwt_token>`

---

## Database Access

### Prisma Studio (Recommended)
```bash
cd backend
npx prisma studio    # Opens http://localhost:5555
```

### pgAdmin Web UI
- URL: http://localhost:5050
- Login: admin@admin.com / admin
- Host: postgres (or localhost from host machine)
- Port: 5432
- Database: taskflow_db
- Username: taskflow_user
- Password: taskflow_pass

---

**Last Updated**: December 2025
**Status**: Active Development
**Language**: English (code, comments, commits, documentation)
