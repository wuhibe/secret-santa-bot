import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { InjectBot, TelegrafModule } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

import { GreeterBotName } from './app.constants';
import { GreeterModule } from './greeter/greeter.module';
import { sessionMiddleware } from './middleware/session.middleware';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    TelegrafModule.forRootAsync({
      botName: GreeterBotName,
      useFactory: () => ({
        token: process.env.GREETER_BOT_TOKEN,
        middlewares: [sessionMiddleware],
        include: [GreeterModule],
      }),
    }),
    GreeterModule,
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    @InjectBot(GreeterBotName)
    private readonly bot: Telegraf,
  ) {}

  async onApplicationBootstrap() {
    const commands = [{ command: 'start', description: 'Start the bot' }];

    await this.bot.telegram.setMyCommands(commands);
  }
}
