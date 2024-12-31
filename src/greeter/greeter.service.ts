import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GreeterService {
  constructor(private readonly prisma: PrismaService) {}

  async saveGroup(groupId: number, groupName: string) {
    return await this.prisma.group.create({
      data: {
        telegramId: groupId.toString(),
        name: groupName,
      },
      include: {
        users: true,
      },
    });
  }

  async getGroups() {
    return await this.prisma.group.findMany({
      include: {
        users: true,
      },
    });
  }

  async getGroup(groupId: string) {
    return await this.prisma.group.findUnique({
      where: { telegramId: groupId },
      include: {
        users: true,
      },
    });
  }

  async saveUser(
    userId: number,
    name: string,
    username: string | undefined,
    groupId: string,
  ) {
    return await this.prisma.user.upsert({
      where: { groupId_telegramId: { groupId, telegramId: userId.toString() } },
      update: {
        name,
        username,
      },
      create: {
        telegramId: userId.toString(),
        name,
        username,
        groupId,
      },
    });
  }

  async getUser(groupId: string, userId: number) {
    return await this.prisma.user.findUnique({
      where: { groupId_telegramId: { groupId, telegramId: userId.toString() } },
    });
  }

  async getUserByTelegramId(telegramId: string) {
    return await this.prisma.user.findFirst({
      where: { telegramId },
    });
  }

  async getMatch(userId: number) {
    return await this.prisma.match.findFirst({
      where: { giverId: userId },
      include: { receiver: true },
    });
  }

  async getUsersByGroupId(groupId: string) {
    return await this.prisma.user.findMany({
      where: { groupId },
    });
  }

  async startSecretSanta(groupId: string) {
    const users = await this.getUsersByGroupId(groupId);

    const givers = users.map((user) => user.id);
    const receivers = users.map((user) => user.id).reverse();

    const matches: { giverId: number; receiverId: number }[] = [];

    while (givers.length > 0 && receivers.length > 0) {
      const i = Math.floor(Math.random() * givers.length);
      const j = Math.floor(Math.random() * receivers.length);

      if (
        givers.length === 1 &&
        receivers.length === 1 &&
        givers[i] === receivers[j]
      ) {
        break;
      }

      const giver = givers[i];
      const receiver = receivers[j];

      if (giver === receiver) {
        continue;
      }

      matches.push({ giverId: giver, receiverId: receiver });
      givers.splice(givers.indexOf(giver), 1);
      receivers.splice(receivers.indexOf(receiver), 1);
    }
    if (matches.length !== users.length) {
      return await this.startSecretSanta(groupId);
    }

    await this.prisma.match.createMany({
      data: matches,
    });

    return await this.prisma.group.update({
      where: { telegramId: groupId },
      data: { matched: true },
    });
  }
}
