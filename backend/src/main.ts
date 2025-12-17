import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { validateRequiredEnvVars } from './config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Validate environment variables before starting
  validateRequiredEnvVars();

  const app = await NestFactory.create(AppModule);

  // Configure CORS
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API Documentation
  // Detect production by checking if not running on localhost
  const isLocalhost = !process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes('localhost');
  // Build API base URL for Swagger
  const apiBaseUrl = process.env.API_BASE_URL || (isLocalhost ? '' : '/api');
  const config = new DocumentBuilder()
    .setTitle('TaskFlow Pro API')
    .setDescription('Full-stack task management system API documentation')
    .setVersion('1.0.0')
    .addServer(apiBaseUrl || '/', isLocalhost ? 'Development' : 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Tasks', 'Task management endpoints')
    .addTag('Categories', 'Category management endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Comments', 'Comment management endpoints')
    .addTag('Health', 'Health check endpoint')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`CORS enabled for: ${frontendUrl}`);
}
void bootstrap();
