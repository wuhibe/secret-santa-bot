import * as fs from 'fs/promises';
import { Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { WizardContext } from 'telegraf/typings/scenes';
import { WIZARD_SCENE_ID } from '../../app.constants';
import { UserData } from '../../interfaces/user-data.interface';

@Wizard(WIZARD_SCENE_ID)
export class GreeterWizard {
  private readonly DATA_FILE = 'user-data.json';

  @WizardStep(1)
  async onSceneEnter(@Ctx() ctx: WizardContext): Promise<string> {
    ctx.wizard.next();
    return 'Welcome! Please send me your name 👋';
  }

  @On('text')
  @WizardStep(2)
  async onName(
    @Ctx() ctx: WizardContext & { wizard: { state: { name: string } } },
    @Message() msg: { text: string },
  ): Promise<string> {
    ctx.wizard.state['name'] = msg.text;
    const userData: UserData = {
      id: ctx.from.id,
      name: ctx.wizard.state.name,
      username: ctx.from.username,
      joinedAt: new Date(),
    };

    await this.saveUserData(userData);
    await ctx.scene.leave();
    return `Thanks ${userData.name}! Your information has been recorded. Welcome to the group! 🎉`;
  }

  private async saveUserData(userData: UserData): Promise<void> {
    try {
      let existingData: UserData[] = [];
      try {
        const fileContent = await fs.readFile(this.DATA_FILE, 'utf-8');
        existingData = JSON.parse(fileContent);
      } catch (error) {
        // File doesn't exist yet, start with empty array
      }

      // Update existing user data or add new user
      const userIndex = existingData.findIndex(
        (user) => user.id === userData.id,
      );
      if (userIndex !== -1) {
        existingData[userIndex] = userData;
      } else {
        existingData.push(userData);
      }

      await fs.writeFile(this.DATA_FILE, JSON.stringify(existingData, null, 2));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new Error('Failed to save user data');
    }
  }
}
