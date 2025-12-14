# TaskFlow Pro

Full-stack task management system with modern architecture.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, shadcn/ui, TailwindCSS, Recharts
- **Backend**: Nest.js 10, TypeScript, Prisma ORM, PostgreSQL
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

Frontend runs on http://localhost:3000

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
│   └── prisma/
│       └── schema.prisma # Database schema
└── frontend/             # Next.js web application
    ├── app/              # App Router pages
    ├── components/       # React components
    ├── lib/              # Utilities
    └── store/            # Zustand state
```

## Available Services

| Service   | URL                    | Description          |
|-----------|------------------------|----------------------|
| Frontend  | http://localhost:3000  | Next.js application  |
| Backend   | http://localhost:3001  | Nest.js API server   |
| pgAdmin   | http://localhost:5050  | Database admin UI    |
| Prisma    | http://localhost:5555  | Prisma Studio        |

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
