# TaskFlow Pro

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql)
![pgAdmin](https://img.shields.io/badge/pgAdmin-9-336791?logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

Full-stack task management system with modern architecture.

## Tech Stack

- **Frontend**: Next.js 16, React 19.2, TypeScript, shadcn/ui, TailwindCSS, Recharts
- **Bundler**: Turbopack (stable, default in Next.js 16)
- **Backend**: Nest.js 11, TypeScript, Prisma ORM 7, PostgreSQL
- **Auth**: JWT-based authentication with bcrypt password hashing
- **Deployment**: Vercel (frontend), Render.io (backend + PostgreSQL)

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### 1. Clone and Setup

```bash
git clone https://github.com/Sam4000133/taskflow-pro.git
cd taskflow-pro
```

### 2. Start Database

```bash
docker-compose up -d
```

Verify containers are running:
```bash
docker-compose ps
```

### 3. Backend Setup

```bash
cd backend
npm install
cp ../.env.example .env
npx prisma migrate dev --name init
npm run start:dev
```

Backend runs on http://localhost:3001

### 4. Frontend Setup

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
npm run dev
```

Frontend runs on http://localhost:3002

## Project Structure

```
taskflow-pro/
├── docker-compose.yml    # PostgreSQL + pgAdmin containers
├── .env.example          # Environment variables template
├── backend/              # Nest.js API server
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── tasks/        # Tasks CRUD
│   │   ├── users/        # User management
│   │   ├── categories/   # Task categories
│   │   ├── comments/     # Task comments
│   │   └── prisma/       # Prisma service
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── prisma.config.ts  # Prisma 7 configuration
└── frontend/             # Next.js web application
    ├── app/              # App Router pages
    ├── components/       # React components
    ├── lib/              # Utilities
    └── store/            # Zustand state
```

## Available Services

| Service    | URL                    | Description          |
|------------|------------------------|----------------------|
| Frontend   | http://localhost:3002  | Next.js application  |
| Backend    | http://localhost:3001  | Nest.js API server   |
| PostgreSQL | localhost:5436         | Database server      |
| pgAdmin    | http://localhost:5056  | Database admin UI    |
| Prisma     | http://localhost:5555  | Prisma Studio        |

## Database Connection

### pgAdmin (Web UI)

1. Open http://localhost:5056
2. Login: `admin@admin.com` / `admin`
3. Add new server:
   - **Host**: `postgres` (container name) or `host.docker.internal`
   - **Port**: `5432` (internal container port)
   - **Database**: `taskflow_db`
   - **Username**: `taskflow_user`
   - **Password**: `taskflow_pass`

### Beekeeper Studio / DBeaver / TablePlus

Connect from your host machine using these settings:

| Parameter | Value |
|-----------|-------|
| Host      | `localhost` |
| Port      | `5436` |
| Database  | `taskflow_db` |
| Username  | `taskflow_user` |
| Password  | `taskflow_pass` |
| SSL       | Disabled |

**Connection string:**
```
postgresql://taskflow_user:taskflow_pass@localhost:5436/taskflow_db
```

### Prisma Studio

```bash
cd backend
npx prisma studio    # Opens http://localhost:5555
```

## Common Commands

### Backend
```bash
npm run start:dev          # Development server
npx prisma studio          # Database browser
npx prisma migrate dev     # Create migration
npx prisma db seed         # Seed demo data
```

### Frontend
```bash
npm run dev                # Development server
npm run build              # Production build
npx shadcn@latest add      # Add UI component
```

### Docker
```bash
docker-compose up -d       # Start containers
docker-compose down        # Stop containers
docker-compose logs -f     # View logs
```

## Demo Credentials

After seeding the database:
- **Email**: demo@taskflow.com
- **Password**: demo123

## License

MIT
