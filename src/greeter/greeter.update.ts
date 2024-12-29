import { Group } from '@prisma/client';
import { Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import { WIZARD_SCENE_ID } from '../app.constants';
import { Context } from '../interfaces/context.interface';
import { GreeterService } from './greeter.service';

@Update()
export class GreeterUpdate {
  private groups: Group[];
  constructor(private readonly greeterService: GreeterService) {
    this.greeterService.getGroups().then((groups) => {
      this.groups = groups;
    });
  }

  @Start()
  async onStart(@Ctx() ctx: Context & { payload?: string }): Promise<string> {
    if (ctx.chat.type === 'private' && ctx.payload) {
      const payload = ctx.payload;
      console.log(payload);
      if (payload.startsWith('register_')) {
        const groupId = payload.split('_')[1];
        await ctx.scene.enter(WIZARD_SCENE_ID, { groupId });
      }
    } else if (ctx.chat.type === 'private') {
      return 'Hello! This bot works best in groups. Start it from the group chat!';
    } else {
      if (
        !this.groups.find(
          (group) => group.telegramId === ctx.chat.id.toString(),
        )
      ) {
        const group = await this.greeterService.saveGroup(
          ctx.chat.id,
          ctx.chat.title,
        );
        this.groups.push(group);
        await ctx.reply(
          `Hello ${group.name}! I'm here to help manage the group. Use /register to provide your information.`,
        );
      }
      return;
    }
  }

  @Command('register')
  async onRegisterCommand(@Ctx() ctx: Context): Promise<void> {
    if (ctx.chat.type !== 'private') {
      await ctx.reply(
        'Please send me a private message to register.',
        Markup.inlineKeyboard([
          [
            Markup.button.url(
              'Register',
              `https://t.me/${ctx.botInfo.username}?start=register_${ctx.chat.id}`,
            ),
          ],
        ]),
      );
      return;
    }
    await ctx.scene.enter(WIZARD_SCENE_ID);
  }
}
