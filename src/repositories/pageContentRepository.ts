import { PrismaClient, PageContent, ContentType, Prisma } from '@prisma/client';

export class PageContentRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(): Promise<PageContent[]> {
    return await this.prisma.pageContent.findMany({
      where: { isActive: true },
      orderBy: { key: 'asc' },
    });
  }

  async findByKey(key: string): Promise<PageContent | null> {
    return await this.prisma.pageContent.findUnique({
      where: { key },
    });
  }

  async create(data: {
    key: string;
    title?: string;
    content: string;
    type: ContentType;
  }): Promise<PageContent> {
    return await this.prisma.pageContent.create({
      data,
    });
  }

  async update(
    key: string,
    data: {
      title?: string;
      content?: string;
      type?: ContentType;
      isActive?: boolean;
    }
  ): Promise<PageContent | null> {
    try {
      return await this.prisma.pageContent.update({
        where: { key },
        data,
      });
    } catch (error) {
      if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async upsert(data: {
    key: string;
    title?: string;
    content: string;
    type: ContentType;
    isActive?: boolean;
  }): Promise<PageContent> {
    return await this.prisma.pageContent.upsert({
      where: { key: data.key },
      update: {
        title: data.title,
        content: data.content,
        type: data.type,
        isActive: data.isActive,
      },
      create: data,
    });
  }
}

