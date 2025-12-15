import { PrismaClient, Role, TaskStatus, TaskPriority } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Prisma with pg adapter for Prisma 7
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper functions for dynamic dates
function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(17, 0, 0, 0); // Set to 5 PM for due dates
  return date;
}

function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

function hoursAgo(hours: number): Date {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create users with realistic names
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@taskflow.com',
        password: hashedPassword,
        name: 'Sarah Mitchell',
        role: Role.ADMIN,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=b6e3f4',
      },
    }),
    prisma.user.create({
      data: {
        email: 'dev@test.com',
        password: hashedPassword,
        name: 'Alex Thompson',
        role: Role.USER,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex&backgroundColor=c0aede',
      },
    }),
    prisma.user.create({
      data: {
        email: 'designer@taskflow.com',
        password: hashedPassword,
        name: 'Emma Rodriguez',
        role: Role.USER,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma&backgroundColor=ffd5dc',
      },
    }),
    prisma.user.create({
      data: {
        email: 'pm@taskflow.com',
        password: hashedPassword,
        name: 'Michael Chen',
        role: Role.ADMIN,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael&backgroundColor=d1f4d1',
      },
    }),
    prisma.user.create({
      data: {
        email: 'qa@taskflow.com',
        password: hashedPassword,
        name: 'David Kim',
        role: Role.USER,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david&backgroundColor=ffeaa7',
      },
    }),
  ]);

  const [admin, developer, designer, pm, qa] = users;
  console.log(`   ✅ Created ${users.length} users`);

  // Create categories
  console.log('📁 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Backend', color: '#22c55e' },
    }),
    prisma.category.create({
      data: { name: 'Frontend', color: '#3b82f6' },
    }),
    prisma.category.create({
      data: { name: 'Design', color: '#8b5cf6' },
    }),
    prisma.category.create({
      data: { name: 'DevOps', color: '#f97316' },
    }),
    prisma.category.create({
      data: { name: 'Documentation', color: '#6b7280' },
    }),
    prisma.category.create({
      data: { name: 'Testing', color: '#ef4444' },
    }),
    prisma.category.create({
      data: { name: 'Research', color: '#14b8a6' },
    }),
  ]);

  const [backend, frontend, design, devops, docs, testing, research] = categories;
  console.log(`   ✅ Created ${categories.length} categories`);

  // Create realistic tasks with dynamic dates
  console.log('📋 Creating tasks...');
  const tasks = await Promise.all([
    // Completed tasks (done in the past)
    prisma.task.create({
      data: {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment. Include staging and production environments with proper secrets management.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: daysAgo(3),
        createdAt: daysAgo(10),
        creatorId: admin.id,
        assigneeId: developer.id,
        categoryId: devops.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design user authentication flow',
        description: 'Create wireframes and high-fidelity mockups for login, registration, and password reset screens.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: daysAgo(5),
        createdAt: daysAgo(12),
        creatorId: pm.id,
        assigneeId: designer.id,
        categoryId: design.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement JWT authentication',
        description: 'Set up secure JWT-based authentication with refresh tokens. Include proper error handling and token expiration management.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: daysAgo(2),
        createdAt: daysAgo(8),
        creatorId: admin.id,
        assigneeId: developer.id,
        categoryId: backend.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create database schema',
        description: 'Design and implement the PostgreSQL database schema using Prisma. Include proper indexing and relations.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: daysAgo(7),
        createdAt: daysAgo(14),
        creatorId: developer.id,
        assigneeId: developer.id,
        categoryId: backend.id,
      },
    }),

    // In Progress tasks
    prisma.task.create({
      data: {
        title: 'Build dashboard analytics component',
        description: 'Implement the main dashboard with task statistics, charts, and recent activity feed. Use Recharts for data visualization.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: daysFromNow(2),
        createdAt: daysAgo(3),
        creatorId: pm.id,
        assigneeId: developer.id,
        categoryId: frontend.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement drag-and-drop for Kanban board',
        description: 'Add drag-and-drop functionality to the Kanban board using @dnd-kit. Ensure smooth animations and optimistic updates.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: daysFromNow(3),
        createdAt: daysAgo(2),
        creatorId: developer.id,
        assigneeId: developer.id,
        categoryId: frontend.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design mobile responsive layouts',
        description: 'Ensure all components are properly responsive on mobile devices. Focus on sidebar navigation and task cards.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: daysFromNow(4),
        createdAt: daysAgo(4),
        creatorId: admin.id,
        assigneeId: designer.id,
        categoryId: design.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Write API endpoint tests',
        description: 'Create comprehensive test suite for all API endpoints using Jest. Include edge cases and error scenarios.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: daysFromNow(1),
        createdAt: daysAgo(5),
        creatorId: pm.id,
        assigneeId: qa.id,
        categoryId: testing.id,
      },
    }),

    // TODO tasks (upcoming)
    prisma.task.create({
      data: {
        title: 'Implement real-time notifications',
        description: 'Set up WebSocket connection for real-time notifications. Include toast messages and notification dropdown in header.',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: daysFromNow(5),
        createdAt: daysAgo(1),
        creatorId: admin.id,
        assigneeId: developer.id,
        categoryId: backend.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Add CSV/PDF export functionality',
        description: 'Allow users to export task data to CSV and PDF formats. Include filtering options and custom date ranges.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: daysFromNow(7),
        createdAt: daysAgo(1),
        creatorId: pm.id,
        assigneeId: developer.id,
        categoryId: frontend.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement global search',
        description: 'Add command palette style search (Cmd+K) for searching tasks, categories, and users across the application.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: daysFromNow(6),
        createdAt: daysAgo(2),
        creatorId: developer.id,
        assigneeId: developer.id,
        categoryId: frontend.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create user documentation',
        description: 'Write comprehensive user guide covering all features of TaskFlow Pro. Include screenshots and video tutorials.',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: daysFromNow(14),
        createdAt: daysAgo(3),
        creatorId: admin.id,
        categoryId: docs.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Research AI task prioritization',
        description: 'Investigate ML-based approaches for automatic task prioritization based on deadlines, dependencies, and user behavior.',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: daysFromNow(21),
        createdAt: daysAgo(1),
        creatorId: pm.id,
        assigneeId: developer.id,
        categoryId: research.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Set up production monitoring',
        description: 'Configure application monitoring using Sentry or similar. Include error tracking, performance monitoring, and alerting.',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: daysFromNow(10),
        createdAt: daysAgo(1),
        creatorId: admin.id,
        assigneeId: developer.id,
        categoryId: devops.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design dark mode theme',
        description: 'Create a cohesive dark mode color scheme. Ensure proper contrast ratios and consistent styling across all components.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: daysFromNow(8),
        createdAt: daysAgo(2),
        creatorId: designer.id,
        assigneeId: designer.id,
        categoryId: design.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement avatar upload',
        description: 'Add ability for users to upload custom profile avatars. Include image cropping and file size validation.',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: daysFromNow(12),
        createdAt: daysAgo(1),
        creatorId: pm.id,
        assigneeId: developer.id,
        categoryId: backend.id,
      },
    }),

    // Overdue tasks (to show urgency)
    prisma.task.create({
      data: {
        title: 'Fix login page accessibility issues',
        description: 'Address WCAG 2.1 compliance issues reported in the accessibility audit. Focus on keyboard navigation and screen reader support.',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: daysAgo(1),
        createdAt: daysAgo(7),
        creatorId: qa.id,
        assigneeId: designer.id,
        categoryId: frontend.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Update security dependencies',
        description: 'Review and update npm packages with known vulnerabilities. Run npm audit and address all high/critical issues.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: daysAgo(2),
        createdAt: daysAgo(4),
        creatorId: admin.id,
        assigneeId: developer.id,
        categoryId: devops.id,
      },
    }),
  ]);

  console.log(`   ✅ Created ${tasks.length} tasks`);

  // Create realistic comments
  console.log('💬 Creating comments...');
  const comments = await Promise.all([
    // Comments on CI/CD pipeline task
    prisma.comment.create({
      data: {
        content: 'I\'ve set up the basic workflow. Tests are running on every push to main and develop branches.',
        taskId: tasks[0].id,
        authorId: developer.id,
        createdAt: daysAgo(5),
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Great work! Can we also add preview deployments for PRs?',
        taskId: tasks[0].id,
        authorId: admin.id,
        createdAt: daysAgo(4),
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Done! Preview URLs are now generated automatically for each PR.',
        taskId: tasks[0].id,
        authorId: developer.id,
        createdAt: daysAgo(3),
      },
    }),

    // Comments on JWT authentication task
    prisma.comment.create({
      data: {
        content: 'I\'m implementing refresh token rotation for better security. Should be done by EOD.',
        taskId: tasks[2].id,
        authorId: developer.id,
        createdAt: daysAgo(3),
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Make sure to handle the edge case where tokens expire during an active session.',
        taskId: tasks[2].id,
        authorId: admin.id,
        createdAt: daysAgo(3),
      },
    }),

    // Comments on dashboard analytics task
    prisma.comment.create({
      data: {
        content: 'I\'ve finished the stats cards. Working on the charts now.',
        taskId: tasks[4].id,
        authorId: developer.id,
        createdAt: hoursAgo(5),
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Looking great! Can we add a date range filter for the activity chart?',
        taskId: tasks[4].id,
        authorId: pm.id,
        createdAt: hoursAgo(3),
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Good idea, I\'ll add that as a follow-up task.',
        taskId: tasks[4].id,
        authorId: developer.id,
        createdAt: hoursAgo(2),
      },
    }),

    // Comments on API tests task
    prisma.comment.create({
      data: {
        content: 'I\'ve completed tests for authentication and user endpoints. Moving to tasks API now.',
        taskId: tasks[7].id,
        authorId: qa.id,
        createdAt: hoursAgo(8),
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Don\'t forget to test the edge cases for task status transitions.',
        taskId: tasks[7].id,
        authorId: developer.id,
        createdAt: hoursAgo(6),
      },
    }),

    // Comments on security update task (overdue)
    prisma.comment.create({
      data: {
        content: 'Found 3 high severity issues. Working on updating the affected packages.',
        taskId: tasks[17].id,
        authorId: developer.id,
        createdAt: daysAgo(3),
      },
    }),
    prisma.comment.create({
      data: {
        content: 'This needs to be prioritized. Let me know if you need help.',
        taskId: tasks[17].id,
        authorId: admin.id,
        createdAt: daysAgo(2),
      },
    }),
    prisma.comment.create({
      data: {
        content: '2 issues resolved. The last one requires some refactoring in the auth module.',
        taskId: tasks[17].id,
        authorId: developer.id,
        createdAt: hoursAgo(12),
      },
    }),

    // Comments on mobile responsive task
    prisma.comment.create({
      data: {
        content: 'I\'ve created a mobile sidebar component using Sheet. Works great on small screens!',
        taskId: tasks[6].id,
        authorId: designer.id,
        createdAt: hoursAgo(4),
      },
    }),
  ]);

  console.log(`   ✅ Created ${comments.length} comments`);

  // Print summary
  console.log('\n📊 Seeding Summary:');
  console.log('─'.repeat(50));
  console.log(`   Users:      ${users.length}`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Tasks:      ${tasks.length}`);
  console.log(`     - Done:        ${tasks.filter(t => t.status === 'DONE').length}`);
  console.log(`     - In Progress: ${tasks.filter(t => t.status === 'IN_PROGRESS').length}`);
  console.log(`     - Todo:        ${tasks.filter(t => t.status === 'TODO').length}`);
  console.log(`   Comments:   ${comments.length}`);
  console.log('─'.repeat(50));
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Demo Credentials (any user, same password):');
  console.log('   Password:  password123');
  console.log('   ─────────────────────────────────────');
  users.forEach(user => {
    console.log(`   ${user.email.padEnd(25)} ${user.role.padEnd(6)} ${user.name}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
