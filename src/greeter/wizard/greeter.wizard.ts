import { Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { WIZARD_SCENE_ID } from '../../app.constants';
import { Context } from '../../interfaces/context.interface';
import { GreeterService } from '../greeter.service';

@Wizard(WIZARD_SCENE_ID)
export class GreeterWizard {
  constructor(private readonly greeterService: GreeterService) {}

  @WizardStep(1)
  async onSceneEnter(@Ctx() ctx: Context): Promise<string> {
    const groupId = ctx.wizard.state.groupId;
    const userId = ctx.from.id;
    const user = await this.greeterService.getUser(groupId, userId);
    if (user) {
      ctx.scene.leave();
      return `Welcome back ${user.name}!\nNo action needed from you for now.\n\nYour Secret Santa recipient will be announced soon!`;
    }
    ctx.wizard.next();
    return 'Welcome! Please send me your name 👋';
  }

  @On('text')
  @WizardStep(2)
  async onName(
    @Ctx()
    ctx: Context,
    @Message() msg: { text: string },
  ): Promise<string> {
    if (
      !msg.text ||
      msg.text.length < 2 ||
      msg.text.length > 32 ||
      msg.text.includes('/')
    ) {
      return 'Please send me your name 👋';
    }
    ctx.wizard.state['name'] = msg.text;
    ctx.wizard.state['username'] = ctx.from.username;
    ctx.wizard.next();
    return `Is this information correct?\n\nName: ${msg.text}\nUsername: ${ctx.from.username || 'Not set'}\n\nSend 'yes' or 'y' to confirm or 'no' or 'n' to restart.`;
  }

  @On('text')
  @WizardStep(3)
  async onConfirmation(
    @Ctx()
    ctx: Context,
    @Message() msg: { text: string },
  ): Promise<string> {
    const answer = msg.text.toLowerCase();

    if (answer === 'yes' || answer === 'y') {
      const user = await this.greeterService.saveUser(
        ctx.from.id,
        ctx.wizard.state.name,
        ctx.from.username,
        ctx.wizard.state.groupId,
      );

      await ctx.scene.leave();
      return `Thanks ${user.name}! Your information has been recorded. Welcome to the group! 🎉`;
    } else if (answer === 'no' || answer === 'n') {
      ctx.wizard.selectStep(1);
      return "Let's start over. Please send me your name 👋";
    } else {
      return 'Please send "yes" or "y" to confirm or "no" or "n" to restart.';
    }
  }
}
