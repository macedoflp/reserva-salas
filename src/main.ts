import {
  BadRequestException,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import type { ValidationError } from 'class-validator';
import { GlobalExceptionFilter } from '@common';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');
const API_GLOBAL_PREFIX = 'api';
const API_VERSION = '1';
const API_BASE_PATH = `/${API_GLOBAL_PREFIX}/v${API_VERSION}`;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION,
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
    .addServer(API_BASE_PATH)
    .build();
  const swaggerDocument = removeSwaggerBasePath(
    SwaggerModule.createDocument(app, swaggerConfig),
    API_BASE_PATH,
  );
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
  logger.log(`API disponível em: ${appUrl}${API_BASE_PATH}`);
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

function removeSwaggerBasePath(
  document: OpenAPIObject,
  basePath: string,
): OpenAPIObject {
  document.paths = Object.fromEntries(
    Object.entries(document.paths).map(([path, pathItem]) => {
      if (path === basePath) {
        return ['/', pathItem];
      }

      if (path.startsWith(`${basePath}/`)) {
        return [path.slice(basePath.length), pathItem];
      }

      return [path, pathItem];
    }),
  );

  return document;
}
