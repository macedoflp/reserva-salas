import {
  BadRequestException,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { ValidationError } from 'class-validator';
import { GlobalExceptionFilter } from '@common';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: createValidationException,
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Reserva de Salas API')
    .setDescription('API para gerenciamento de salas e reservas')
    .setVersion('1.0.0')
    .addServer('/api/v1')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
    },
  };
  SwaggerModule.setup('docs', app, swaggerDocument, swaggerOptions);
  SwaggerModule.setup('api/docs', app, swaggerDocument, swaggerOptions);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);

  await app.listen(port);

  const appUrl = await app.getUrl();
  logger.log(`API disponível em: ${appUrl}/api/v1`);
  logger.log(`Swagger disponível em: ${appUrl}/docs`);
  logger.log(`Swagger também disponível em: ${appUrl}/api/docs`);
}
void bootstrap();

function createValidationException(
  validationErrors: ValidationError[],
): BadRequestException {
  const messages = flattenValidationErrors(validationErrors);

  return new BadRequestException(
    messages.length > 0 ? messages.join('; ') : 'Dados inválidos.',
  );
}

function flattenValidationErrors(
  validationErrors: ValidationError[],
): string[] {
  return validationErrors.flatMap((validationError) => {
    const constraints = Object.values(validationError.constraints ?? {});
    const children = flattenValidationErrors(validationError.children ?? []);

    return [...constraints, ...children];
  });
}
