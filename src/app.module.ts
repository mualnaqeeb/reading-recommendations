import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { AppController } from './app.controller';
import { AdminModule } from './apps/admin/admin.module';
import { UserModule } from './apps/user/user.module';
import { UtilModule } from './util/utiil.module';

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
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
