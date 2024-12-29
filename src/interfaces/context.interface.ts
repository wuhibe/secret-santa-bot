import { WizardContext } from 'telegraf/typings/scenes';

export type Context = WizardContext & {
  wizard: { state: { groupId: string; name: string } };
};
