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

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@taskflow.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@taskflow.com',
      password: hashedPassword,
      name: 'John Doe',
      role: Role.USER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    },
  });

  console.log(`   ✅ Created ${adminUser.email} (Admin)`);
  console.log(`   ✅ Created ${regularUser.email} (User)`);

  // Create categories
  console.log('📁 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Development', color: '#22c55e' },
    }),
    prisma.category.create({
      data: { name: 'Design', color: '#8b5cf6' },
    }),
    prisma.category.create({
      data: { name: 'Marketing', color: '#f59e0b' },
    }),
  ]);

  console.log(`   ✅ Created ${categories.length} categories`);

  // Create tasks
  console.log('📋 Creating tasks...');
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Setup project architecture',
        description: 'Define the folder structure and setup initial configuration for the project.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: yesterday,
        creatorId: adminUser.id,
        assigneeId: adminUser.id,
        categoryId: categories[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement user authentication',
        description: 'Create login, register, and JWT token management system.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: tomorrow,
        creatorId: adminUser.id,
        assigneeId: regularUser.id,
        categoryId: categories[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design dashboard mockups',
        description: 'Create Figma mockups for the main dashboard and task management views.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: nextWeek,
        creatorId: regularUser.id,
        assigneeId: regularUser.id,
        categoryId: categories[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Write API documentation',
        description: 'Document all REST API endpoints with examples and response schemas.',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: nextWeek,
        creatorId: adminUser.id,
        categoryId: categories[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create marketing landing page',
        description: 'Design and implement the public landing page for the product.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: yesterday, // Overdue task
        creatorId: regularUser.id,
        categoryId: categories[2].id,
      },
    }),
  ]);

  console.log(`   ✅ Created ${tasks.length} tasks`);

  // Create comments
  console.log('💬 Creating comments...');
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Great progress on this! The architecture looks solid.',
        taskId: tasks[0].id,
        authorId: regularUser.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'JWT implementation is almost done. Need to add refresh token logic.',
        taskId: tasks[1].id,
        authorId: regularUser.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Let me know if you need any help with the authentication flow.',
        taskId: tasks[1].id,
        authorId: adminUser.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'I will start working on this after finishing the auth module.',
        taskId: tasks[2].id,
        authorId: regularUser.id,
      },
    }),
  ]);

  console.log(`   ✅ Created ${comments.length} comments`);

  // Print summary
  console.log('\n📊 Seeding Summary:');
  console.log('─'.repeat(40));
  console.log(`   Users:      2 (1 Admin, 1 User)`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Tasks:      ${tasks.length}`);
  console.log(`   Comments:   ${comments.length}`);
  console.log('─'.repeat(40));
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Demo Credentials:');
  console.log('   Admin: admin@taskflow.com / password123');
  console.log('   User:  user@taskflow.com / password123');
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
