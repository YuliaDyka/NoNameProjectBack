import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Cinema Booking API')
    .setDescription('API documentation for cinema booking')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  // app.useGlobalFilters(new PrismaExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
