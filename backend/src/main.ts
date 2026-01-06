import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS TRÈS PERMISSIF POUR LE DÉVELOPPEMENT
  // Autorise toutes les origines, méthodes et headers.
  // ⚠️ À restreindre en production (origin, credentials, etc.).
  app.enableCors({
    origin: true, // ou '*' (mais true reflète l'origine de la requête)
    methods: '*',
    allowedHeaders: '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Quiz API')
    .setDescription('API de gestion des quizzes (exemple pédagogique)')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
