import { Controller, Get } from '@nestjs/common';
import { Public } from './common/auth/decorator';

@Controller()
@Public()
export class AppController {
  constructor() { }

  @Get('health-check')
  getHealthCheck(): string {
    return 'OK';
  }

}
