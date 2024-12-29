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
    const privateCommands = [
      { command: 'start', description: 'Start the bot' },
      { command: 'profile', description: 'View your profile' },
      { command: 'edit_profile', description: 'Edit your profile' },
      { command: 'gift_to', description: 'View who you are giving gift to' },
    ];

    const groupCommands = [
      { command: 'start', description: 'Start the bot' },
      { command: 'list', description: 'List users in the game for the group' },
    ];

    await this.bot.telegram.setMyCommands(groupCommands, {
      scope: {
        type: 'all_group_chats',
      },
    });
    await this.bot.telegram.setMyCommands(privateCommands, {
      scope: {
        type: 'all_private_chats',
      },
    });
  }
}
