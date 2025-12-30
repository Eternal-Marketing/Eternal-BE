import { PrismaClient, Category, Prisma } from '@prisma/client';

export class CategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(includeInactive = false): Promise<Category[]> {
    const where: Prisma.CategoryWhereInput = {};
    
    if (!includeInactive) {
      where.isActive = true;
    }

    return await this.prisma.category.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            columns: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            columns: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return await this.prisma.category.findUnique({
      where: { slug },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string | null;
    order?: number;
  }): Promise<Category> {
    return await this.prisma.category.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      parentId?: string | null;
      order?: number;
      isActive?: boolean;
    }
  ): Promise<Category | null> {
    try {
      return await this.prisma.category.update({
        where: { id },
        data,
      });
    } catch (error) {
      if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }
}

