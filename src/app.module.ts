import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RouterModule.register([
      {
        path: 'user',
        module: UserModule,
        children: []
      },
      {
        path: 'admin',
        module: AdminModule,
        children: [
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
export class AppModule { }
