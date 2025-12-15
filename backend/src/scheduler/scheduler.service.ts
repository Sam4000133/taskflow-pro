import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma';
import { ConfigService } from '@nestjs/config';

// Helper functions for dynamic dates
function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(17, 0, 0, 0);
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

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    if (isProduction) {
      this.logger.log('Production mode: Database will reset every 24 hours at midnight UTC');
    } else {
      this.logger.log('Development mode: Automatic database reset is disabled');
    }
  }

  // Run every day at midnight UTC
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDatabaseReset() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (!isProduction) {
      this.logger.debug('Skipping database reset in development mode');
      return;
    }

    this.logger.log('Starting scheduled database reset...');

    try {
      await this.resetDatabase();
      this.logger.log('Database reset completed successfully');
    } catch (error) {
      this.logger.error('Database reset failed:', error);
    }
  }

  async resetDatabase() {
    this.logger.log('Clearing existing data...');

    // Delete in order respecting foreign keys
    await this.prisma.comment.deleteMany();
    await this.prisma.task.deleteMany();
    await this.prisma.category.deleteMany();
    await this.prisma.user.deleteMany();

    this.logger.log('Seeding demo data...');

    // Create demo users
    const users = await Promise.all([
      this.prisma.user.create({
        data: {
          email: 'sarah@taskflow.demo',
          password: '$2b$10$rQZ8K.5Y5Y5Y5Y5Y5Y5Y5OqJ3F.5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y',
          name: 'Sarah Mitchell',
          role: 'ADMIN',
          avatar: null,
        },
      }),
      this.prisma.user.create({
        data: {
          email: 'alex@taskflow.demo',
          password: '$2b$10$rQZ8K.5Y5Y5Y5Y5Y5Y5Y5OqJ3F.5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y',
          name: 'Alex Johnson',
          role: 'USER',
          avatar: null,
        },
      }),
      this.prisma.user.create({
        data: {
          email: 'emma@taskflow.demo',
          password: '$2b$10$rQZ8K.5Y5Y5Y5Y5Y5Y5Y5OqJ3F.5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y',
          name: 'Emma Wilson',
          role: 'USER',
          avatar: null,
        },
      }),
      this.prisma.user.create({
        data: {
          email: 'james@taskflow.demo',
          password: '$2b$10$rQZ8K.5Y5Y5Y5Y5Y5Y5Y5OqJ3F.5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y',
          name: 'James Chen',
          role: 'USER',
          avatar: null,
        },
      }),
      this.prisma.user.create({
        data: {
          email: 'dev@test.com',
          password: '$2b$10$rQZ8K.5Y5Y5Y5Y5Y5Y5Y5OqJ3F.5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y',
          name: 'Demo User',
          role: 'USER',
          avatar: null,
        },
      }),
    ]);

    const [sarah, alex, emma, james, demo] = users;

    // Create categories
    const categories = await Promise.all([
      this.prisma.category.create({
        data: { name: 'Development', color: '#3B82F6' },
      }),
      this.prisma.category.create({
        data: { name: 'Design', color: '#EC4899' },
      }),
      this.prisma.category.create({
        data: { name: 'Marketing', color: '#F59E0B' },
      }),
      this.prisma.category.create({
        data: { name: 'Bug Fix', color: '#EF4444' },
      }),
      this.prisma.category.create({
        data: { name: 'Documentation', color: '#8B5CF6' },
      }),
      this.prisma.category.create({
        data: { name: 'Research', color: '#06B6D4' },
      }),
      this.prisma.category.create({
        data: { name: 'Infrastructure', color: '#10B981' },
      }),
    ]);

    const [development, design, marketing, bugFix, documentation, research, infrastructure] = categories;

    // Create tasks with dynamic dates
    const tasks = await Promise.all([
      // TODO tasks
      this.prisma.task.create({
        data: {
          title: 'Implement user authentication flow',
          description: 'Add login, registration, and password reset functionality with JWT tokens',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: daysFromNow(3),
          creatorId: sarah.id,
          assigneeId: alex.id,
          categoryId: development.id,
        },
      }),
      this.prisma.task.create({
        data: {
          title: 'Design new dashboard layout',
          description: 'Create wireframes and mockups for the updated dashboard with better UX',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: daysFromNow(5),
          creatorId: sarah.id,
          assigneeId: emma.id,
          categoryId: design.id,
        },
      }),
      this.prisma.task.create({
        data: {
          title: 'Write API documentation',
          description: 'Document all REST endpoints with request/response examples',
          status: 'TODO',
          priority: 'LOW',
          dueDate: daysFromNow(10),
          creatorId: alex.id,
          assigneeId: james.id,
          categoryId: documentation.id,
        },
      }),
      this.prisma.task.create({
        data: {
          title: 'Research competitor features',
          description: 'Analyze top 5 competitors and identify potential features to implement',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: daysFromNow(7),
          creatorId: emma.id,
          assigneeId: emma.id,
          categoryId: research.id,
        },
      }),
      this.prisma.task.create({
        data: {
          title: 'Set up CI/CD pipeline',
          description: 'Configure GitHub Actions for automated testing and deployment',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: daysFromNow(4),
          creatorId: james.id,
          assigneeId: james.id,
          categoryId: infrastructure.id,
        },
      }),
      // IN_PROGRESS tasks
      this.prisma.task.create({
        data: {
          title: 'Build task filtering system',
          description: 'Implement advanced filters by status, priority, assignee, and date range',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          dueDate: daysFromNow(2),
          creatorId: sarah.id,
          assigneeId: alex.id,
          categoryId: development.id,
        },
      }),
      this.prisma.task.create({
        data: {
          title: 'Create email templates',
          description: 'Design responsive email templates for notifications and newsletters',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          dueDate: daysFromNow(4),
          creatorId: emma.id,
          assigneeId: emma.id,
          categoryId: design.id,
        },
      }),
      this.prisma.task.create({
        data: {
          title: 'Fix login page mobile layout',
          description: 'The login form breaks on screens smaller than 375px width',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          dueDate: daysFromNow(1),
          creatorId: alex.id,
          assigneeId: alex.id,
          categoryId: bugFix.id,
        },
      }),
      this.prisma.task.create({
        data: {
          title: 'Prepare Q4 marketing campaign',
          description: 'Plan social media strategy and content calendar for product launch',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          dueDate: daysFromNow(6),
          creatorId: sarah.id,
          assigneeId: james.id,
          categoryId: marketing.id,
        },
      }),
      // DONE tasks
      this.prisma.task.create({
        data: {
          title: 'Set up project repository',
          description: 'Initialize Git repository with proper .gitignore and README',
          status: 'DONE',
          priority: 'HIGH',
          dueDate: daysAgo(5),
          creatorId: sarah.id,
          assigneeId: sarah.id,
          categoryId: infrastructure.id,
        },
      }),
      this.prisma.task.create({
        data: {
          title: 'Design system color palette',
          description: 'Define primary, secondary, and accent colors with dark mode variants',
          status: 'DONE',
          priority: 'MEDIUM',
          dueDate: daysAgo(3),
          creatorId: emma.id,
          assigneeId: emma.id,
          categoryId: design.id,
        },
      }),
      this.prisma.task.create({
        data: {
          title: 'Database schema design',
          description: 'Create ERD and define all tables with relationships',
          status: 'DONE',
          priority: 'HIGH',
          dueDate: daysAgo(7),
          creatorId: sarah.id,
          assigneeId: james.id,
          categoryId: development.id,
        },
      }),
      this.prisma.task.create({
        data: {
          title: 'User research interviews',
          description: 'Conduct 10 user interviews to understand pain points and needs',
          status: 'DONE',
          priority: 'HIGH',
          dueDate: daysAgo(10),
          creatorId: emma.id,
          assigneeId: emma.id,
          categoryId: research.id,
        },
      }),
      this.prisma.task.create({
        data: {
          title: 'Fix pagination bug',
          description: 'Pagination shows incorrect total count after filtering',
          status: 'DONE',
          priority: 'MEDIUM',
          dueDate: daysAgo(2),
          creatorId: alex.id,
          assigneeId: alex.id,
          categoryId: bugFix.id,
        },
      }),
      this.prisma.task.create({
        data: {
          title: 'Write onboarding copy',
          description: 'Create engaging copy for the onboarding flow and tooltips',
          status: 'DONE',
          priority: 'LOW',
          dueDate: daysAgo(1),
          creatorId: sarah.id,
          assigneeId: james.id,
          categoryId: marketing.id,
        },
      }),
      // Additional tasks with various states
      this.prisma.task.create({
        data: {
          title: 'Implement dark mode toggle',
          description: 'Add system preference detection and manual toggle option',
          status: 'DONE',
          priority: 'MEDIUM',
          dueDate: daysAgo(4),
          creatorId: alex.id,
          assigneeId: alex.id,
          categoryId: development.id,
        },
      }),
      this.prisma.task.create({
        data: {
          title: 'Optimize database queries',
          description: 'Review and optimize slow queries identified in production logs',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: daysFromNow(3),
          creatorId: sarah.id,
          assigneeId: james.id,
          categoryId: infrastructure.id,
        },
      }),
      this.prisma.task.create({
        data: {
          title: 'Create landing page design',
          description: 'Design hero section, features, pricing, and testimonials sections',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          dueDate: daysFromNow(5),
          creatorId: sarah.id,
          assigneeId: emma.id,
          categoryId: design.id,
        },
      }),
    ]);

    // Create comments with dynamic timestamps
    await Promise.all([
      this.prisma.comment.create({
        data: {
          content: 'I\'ve started working on the JWT implementation. Should be done by tomorrow.',
          taskId: tasks[0].id,
          authorId: alex.id,
          createdAt: hoursAgo(5),
        },
      }),
      this.prisma.comment.create({
        data: {
          content: 'Great! Make sure to use refresh tokens for better security.',
          taskId: tasks[0].id,
          authorId: sarah.id,
          createdAt: hoursAgo(4),
        },
      }),
      this.prisma.comment.create({
        data: {
          content: 'I\'ve uploaded the initial wireframes to Figma. Check the design system folder.',
          taskId: tasks[1].id,
          authorId: emma.id,
          createdAt: hoursAgo(24),
        },
      }),
      this.prisma.comment.create({
        data: {
          content: 'The filter component is almost done. Just need to add the date range picker.',
          taskId: tasks[5].id,
          authorId: alex.id,
          createdAt: hoursAgo(2),
        },
      }),
      this.prisma.comment.create({
        data: {
          content: 'Found the issue - it was a CSS flexbox problem. Fix incoming.',
          taskId: tasks[7].id,
          authorId: alex.id,
          createdAt: hoursAgo(8),
        },
      }),
      this.prisma.comment.create({
        data: {
          content: 'Campaign brief is ready for review. Targeting tech professionals aged 25-45.',
          taskId: tasks[8].id,
          authorId: james.id,
          createdAt: hoursAgo(12),
        },
      }),
      this.prisma.comment.create({
        data: {
          content: 'All relationships look good. Ready for implementation.',
          taskId: tasks[11].id,
          authorId: sarah.id,
          createdAt: hoursAgo(168),
        },
      }),
      this.prisma.comment.create({
        data: {
          content: 'Key insight: Users want better keyboard shortcuts for power users.',
          taskId: tasks[12].id,
          authorId: emma.id,
          createdAt: hoursAgo(240),
        },
      }),
      this.prisma.comment.create({
        data: {
          content: 'Theme toggle working with system preference detection.',
          taskId: tasks[15].id,
          authorId: alex.id,
          createdAt: hoursAgo(96),
        },
      }),
      this.prisma.comment.create({
        data: {
          content: 'I\'ve identified 3 slow queries. Will create indexes to improve performance.',
          taskId: tasks[16].id,
          authorId: james.id,
          createdAt: hoursAgo(6),
        },
      }),
      this.prisma.comment.create({
        data: {
          content: 'Hero section mockup is ready! Moving to features section next.',
          taskId: tasks[17].id,
          authorId: emma.id,
          createdAt: hoursAgo(3),
        },
      }),
      this.prisma.comment.create({
        data: {
          content: 'Love the direction! Can we add some subtle animations?',
          taskId: tasks[17].id,
          authorId: sarah.id,
          createdAt: hoursAgo(1),
        },
      }),
      this.prisma.comment.create({
        data: {
          content: 'Documentation structure looks good. Using OpenAPI 3.0 spec.',
          taskId: tasks[2].id,
          authorId: james.id,
          createdAt: hoursAgo(48),
        },
      }),
      this.prisma.comment.create({
        data: {
          content: 'GitHub Actions workflow is configured. Need to add test coverage.',
          taskId: tasks[4].id,
          authorId: james.id,
          createdAt: hoursAgo(10),
        },
      }),
    ]);

    this.logger.log(`Created ${users.length} users, ${categories.length} categories, ${tasks.length} tasks with comments`);
  }
}
