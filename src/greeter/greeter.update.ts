import { Command, Ctx, Hears, Sender, Start, Update } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import { UpdateType as TelegrafUpdateType } from 'telegraf/typings/telegram-types';
import { WIZARD_SCENE_ID } from '../app.constants';
import { UpdateType } from '../common/decorators/update-type.decorator';
import { Context } from '../interfaces/context.interface';

@Update()
export class GreeterUpdate {
  @Start()
  onStart(): string {
    return 'Say hello to me';
  }

  @Hears(['hi', 'hello', 'hey', 'qq'])
  onGreetings(
    @UpdateType() updateType: TelegrafUpdateType,
    @Sender('first_name') firstName: string,
  ): string {
    return `Hey ${firstName}`;
  }

  @Command('wizard')
  async onWizardCommand(@Ctx() ctx: Context): Promise<void> {
    await ctx.scene.enter(WIZARD_SCENE_ID);
  }

  @Command('app')
  async onWebInlineCommand(@Ctx() ctx: Context) {
    ctx.reply(
      'Click the button below to open our web application',
      Markup.inlineKeyboard([
        [Markup.button.webApp('Open Web App', process.env.WEB_APP_URL)],
      ]),
    );
  }
}
