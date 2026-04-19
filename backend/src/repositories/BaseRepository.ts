import { PrismaClient } from "@prisma/client";
import { IRepository } from "../interfaces/IRepository";

// Shared Prisma client instance
export const prisma = new PrismaClient();

export abstract class BaseRepository<T> implements IRepository<T> {
  protected prisma: PrismaClient;
  protected abstract modelName: string;

  constructor() {
    this.prisma = prisma;
  }

  protected abstract get model(): any;

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findAll(filter?: Record<string, unknown>): Promise<T[]> {
    return this.model.findMany({ where: filter });
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({ where: { id } });
  }
}
