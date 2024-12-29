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
    });
  }

  async getGroup(groupId: number) {
    return await this.prisma.group.findUnique({
      where: { telegramId: groupId.toString() },
    });
  }

  async saveUser(userId: number, userName: string, groupId: number) {
    await this.prisma.user.create({
      data: {
        telegramId: userId.toString(),
        name: userName,
        groupId: groupId,
      },
    });
  }

  async getUser(userId: number) {
    return await this.prisma.user.findUnique({
      where: { telegramId: userId.toString() },
    });
  }

  async getUsersByGroupId(groupId: number) {
    return await this.prisma.user.findMany({
      where: { groupId: groupId },
    });
  }

  async getGroups() {
    return await this.prisma.group.findMany();
  }
}
