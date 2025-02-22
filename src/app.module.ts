import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { AppController } from './app.controller';
import { AdminModule } from './apps/admin/admin.module';
import { UserModule } from './apps/user/user.module';
import { UtilModule } from './util/utiil.module';
import { AuthModule } from './common/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './common/auth/guard/auth.guard';
import { RolesGuard } from './common/auth/guard/role.guard';
import { BookModule } from './apps/admin/book/book.module';
import { BookReadingModule } from './apps/user/reading-book/book-reading.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RouterModule.register([
      {
        path: 'user',
        module: UserModule,
        children: [
          {
            path: 'book',
            module: BookReadingModule
          }
        ]
      },
      {
        path: 'admin',
        module: AdminModule,
        children: [
          {
            path: 'book',
            module: BookModule,
          }
        ]
      },
    ]),
    UserModule,
    AdminModule,
    UtilModule,
    AuthModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}