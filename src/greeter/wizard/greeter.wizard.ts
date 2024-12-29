import { Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { WizardContext } from 'telegraf/typings/scenes';
import { WIZARD_SCENE_ID } from '../../app.constants';

@Wizard(WIZARD_SCENE_ID)
export class GreeterWizard {
  @WizardStep(1)
  async onSceneEnter(@Ctx() ctx: WizardContext): Promise<string> {
    ctx.wizard.next();
    return 'Welcome to wizard scene ✋ Send me your name';
  }

  @On('text')
  @WizardStep(2)
  async onName(
    @Ctx() ctx: WizardContext,
    @Message() msg: { text: string },
  ): Promise<string> {
    ctx.wizard.state['name'] = msg.text;
    ctx.wizard.next();
    return 'Send me where are you from';
  }

  @On('text')
  @WizardStep(3)
  async onLocation(
    @Ctx() ctx: WizardContext & { wizard: { state: { name: string } } },
    @Message() msg: { text: string },
  ): Promise<string> {
    await ctx.scene.leave();
    return `Hello ${ctx.wizard.state.name} from ${msg.text}. I'm Greeter bot from 127.0.0.1 👋`;
  }
}
