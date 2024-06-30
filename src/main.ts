import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';
import { AdminModule } from './apps/admin/admin.module';
import { UserModule } from './apps/user/user.module';
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
    //.......................................................................................................................................
    const adminConfig = new DocumentBuilder()
      .setTitle('Admin API')
      .setDescription('Admin API docs')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const adminDocument = SwaggerModule.createDocument(app, adminConfig, {
      include: [AdminModule],
    });
    SwaggerModule.setup('docs/admin', app, adminDocument), {
      swaggerOptions: {
        persistAuthorization: true,
      },
    };
    //.......................................................................................................................................
    const userConfig = new DocumentBuilder()
      .setTitle('User API')
      .setDescription('User API docs')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const userDocument = SwaggerModule.createDocument(app, userConfig, {
      include: [UserModule],
    });
    SwaggerModule.setup('docs/user', app, userDocument), {
      swaggerOptions: {
        persistAuthorization: true,
      },
    };
  }
  //.......................................................................................................................................
  const PORT = process.env.PORT || 8080;
  await app.listen(PORT);
  //.......................................................................................................................................
  console.log('Node Environment: ', process.env.NODE_ENV);
  console.log('Server running on port: ', PORT);
}
bootstrap();
