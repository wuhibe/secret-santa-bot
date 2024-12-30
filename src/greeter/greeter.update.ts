import { Group, User } from '@prisma/client';
import { Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import { EDIT_PROFILE_SCENE_ID, WIZARD_SCENE_ID } from '../app.constants';
import { Context } from '../interfaces/context.interface';
import { GreeterService } from './greeter.service';

@Update()
export class GreeterUpdate {
  private groups: (Group & { users: User[] })[];

  constructor(private readonly greeterService: GreeterService) {
    this.greeterService.getGroups().then((groups) => {
      this.groups = groups;
    });
  }

  @Start()
  async onStart(@Ctx() ctx: Context & { payload?: string }): Promise<string> {
    if (ctx.chat.type === 'private' && ctx.payload) {
      const payload = ctx.payload;
      if (payload.startsWith('register_')) {
        const groupId = payload.split('_')[1];
        const group = await this.greeterService.getGroup(groupId);
        if (!group) {
          await ctx.reply('Group is not registered.');
          return;
        }
        if (group.matched) {
          await ctx.reply('Secret Santa has already started.');
          return;
        }
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
      }
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
    }
  }

  @Command('list')
  async onListCommand(@Ctx() ctx: Context): Promise<void> {
    if (ctx.chat.type !== 'private') {
      const group = await this.greeterService.getGroup(ctx.chat.id.toString());
      if (!group) {
        await ctx.reply(
          'Group is not registered. Please use /start to register group.',
        );
        return;
      }
      const users = await this.greeterService.getUsersByGroupId(
        group.telegramId,
      );
      await ctx.reply(
        `Users in ${group.name}:\n\n${users
          .map(
            (user) =>
              `${user.name} (${user.username ? '@' + user.username : 'No username'})`,
          )
          .join('\n')}`,
      );
    } else {
      await ctx.reply('Please use this command in a group chat.');
    }
  }

  @Command('edit_profile')
  async onEditProfileCommand(@Ctx() ctx: Context): Promise<void> {
    if (ctx.chat.type !== 'private') {
      await ctx.reply('Please use this command in a private chat.');
      return;
    }
    const user = await this.greeterService.getUserByTelegramId(
      ctx.from.id.toString(),
    );
    if (!user) {
      await ctx.reply('You are not registered in any group.');
      return;
    }
    await ctx.scene.enter(EDIT_PROFILE_SCENE_ID, {
      groupId: user.groupId,
    });
  }

  @Command('profile')
  async onProfileCommand(@Ctx() ctx: Context): Promise<void> {
    if (ctx.chat.type !== 'private') {
      await ctx.reply('Please use this command in a private chat.');
      return;
    }
    const user = await this.greeterService.getUserByTelegramId(
      ctx.from.id.toString(),
    );
    if (!user) {
      await ctx.reply('You are not registered in any group.');
      return;
    }
    await ctx.reply(
      `Your profile information: ${user.name} (${user.username ? '@' + user.username : 'No username'})`,
    );
  }

  @Command('gift_to')
  async onRecepientCommand(@Ctx() ctx: Context): Promise<void> {
    if (ctx.chat.type !== 'private') {
      await ctx.reply('Please use this command in a private chat.');
      return;
    }
    const user = await this.greeterService.getUserByTelegramId(
      ctx.from.id.toString(),
    );

    if (!user) {
      await ctx.reply('You are not registered in any group.');
      return;
    }
    const group = await this.greeterService.getGroup(user.groupId);
    if (!group.matched) {
      await ctx.reply(
        `Secret Santa is not started yet for ${group.name}.\nPlease wait for the admin to start it.`,
      );
      return;
    }

    const match = await this.greeterService.getMatch(user.id);
    if (!match) {
      await ctx.reply('You are not matched with anyone.');
      return;
    }

    await ctx.reply(
      `Your recepient is ${match.receiver.name} (${match.receiver.username ? '@' + match.receiver.username : 'No username'})`,
    );
  }

  @Command('start_secret_santa')
  async onStartSecretSantaCommand(@Ctx() ctx: Context): Promise<void> {
    const group = await this.greeterService.getGroup(ctx.chat.id.toString());
    if (!group) {
      await ctx.reply(
        'Group is not registered. Please use /start to register group.',
      );
      return;
    }
    if (group.matched) {
      await ctx.reply('Secret Santa is already started.');
      return;
    }
    if (group.users.length < 2) {
      await ctx.reply('There are not enough players registered.');
      return;
    }
    await this.greeterService.startSecretSanta(group.telegramId);
    await ctx.reply('Secret Santa has been started.');

    // send texts to all users
    for (const user of group.users) {
      await ctx.telegram.sendMessage(
        user.telegramId,
        'Secret Santa matches have been drawn.\nSend me /gift_to to find out your recepient.',
      );
    }
  }
}
