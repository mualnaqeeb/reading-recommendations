import { Controller, Get } from '@nestjs/common';
import { Public } from './common/auth/decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@Public()
@ApiTags('Health Check')
export class AppController {
  constructor() { }

  @Get('health-check')
  getHealthCheck(): string {
    return 'OK';
  }

}
