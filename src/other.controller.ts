import { Controller, Get } from '@nestjs/common';

@Controller('other')
export class OtherController {
  @Get('hello')
  hello() {
    return 'Hello, World!';
  }
}
