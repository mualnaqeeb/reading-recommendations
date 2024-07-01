import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
async function bootstrap() {
  //................................................................................................................................
  const app = await NestFactory.create(AppModule);
  //................................................................................................................................
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  //.......................................................................................................................................
  app.useGlobalFilters(new AllExceptionsFilter());
  //.......................................................................................................................................
  app.enableCors();
  //.......................................................................................................................................
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.HEADER,
    header: 'x-api-version',
  });
  //.......................................................................................................................................
  if (process.env.NODE_ENV === 'development') {
    const docsUser = process.env.DOCS_USERNAME;
    const docsPass = process.env.DOCS_PASSWORD;
    app.use(
      '/docs',
      basicAuth({
        challenge: true,
        users: { [docsUser]: docsPass },
      }),
    );
    //.......................................................................................................................................
    const config = new DocumentBuilder()
      .setTitle('Reading List')
      .setDescription('Reading List API docs')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document), {
      swaggerOptions: {
        persistAuthorization: true,
      },
    };
  }
  const PORT = process.env.PORT || 8080;
  await app.listen(PORT);
  //.......................................................................................................................................
  console.log('Node Environment: ', process.env.NODE_ENV);
  console.log('Server running on port: ', PORT);
}
bootstrap();
