import { PrismaClient, Tag, Prisma } from '@prisma/client';

export interface TagWithCount extends Tag {
  _count: {
    columns: number;
  };
}

export class TagRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(includeCount = false): Promise<Tag[] | TagWithCount[]> {
    return await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: includeCount
        ? {
            _count: {
              select: {
                columns: true,
              },
            },
          }
        : undefined,
    });
  }

  async findById(id: string): Promise<Tag | null> {
    return await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            columns: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    return await this.prisma.tag.findUnique({
      where: { slug },
    });
  }

  async findByName(name: string): Promise<Tag | null> {
    return await this.prisma.tag.findUnique({
      where: { name },
    });
  }

  async create(data: { name: string; slug: string }): Promise<Tag> {
    return await this.prisma.tag.create({
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tag.delete({
      where: { id },
    });
  }

  async findOrCreate(name: string, slug: string): Promise<Tag> {
    const existing = await this.findByName(name);
    if (existing) {
      return existing;
    }

    return await this.create({ name, slug });
  }
}

