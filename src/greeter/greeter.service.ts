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
    });
  }

  async saveUser(
    userId: number,
    name: string,
    username: string,
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
}
