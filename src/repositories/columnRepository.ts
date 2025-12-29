import { PrismaClient, Column, ColumnStatus, Prisma } from '@prisma/client';

export interface ColumnWithRelations extends Column {
  author: {
    id: string;
    name: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export interface FindColumnsOptions {
  status?: ColumnStatus;
  categoryId?: string;
  tagId?: string;
  search?: string;
  authorId?: string;
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'publishedAt' | 'viewCount' | 'title';
  orderDirection?: 'asc' | 'desc';
}

export class ColumnRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(options: FindColumnsOptions = {}): Promise<{
    columns: ColumnWithRelations[];
    total: number;
  }> {
    const {
      status,
      categoryId,
      tagId,
      search,
      authorId,
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.ColumnWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (authorId) {
      where.authorId = authorId;
    }

    const [columns, total] = await Promise.all([
      this.prisma.column.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [orderBy]: orderDirection,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.column.count({ where }),
    ]);

    // Transform tags
    const transformedColumns: ColumnWithRelations[] = columns.map((column) => ({
      ...column,
      tags: column.tags.map((ct) => ct.tag),
    })) as ColumnWithRelations[];

    return {
      columns: transformedColumns,
      total,
    };
  }

  async findById(id: string): Promise<ColumnWithRelations | null> {
    const column = await this.prisma.column.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!column) return null;

    return {
      ...column,
      tags: column.tags.map((ct) => ct.tag),
    } as ColumnWithRelations;
  }

  async findBySlug(slug: string): Promise<ColumnWithRelations | null> {
    const column = await this.prisma.column.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!column) return null;

    return {
      ...column,
      tags: column.tags.map((ct) => ct.tag),
    } as ColumnWithRelations;
  }

  async create(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    thumbnailUrl?: string;
    status: ColumnStatus;
    authorId: string;
    categoryId?: string;
    tagIds?: string[];
    publishedAt?: Date;
  }): Promise<Column> {
    const { tagIds, ...columnData } = data;

    return await this.prisma.column.create({
      data: {
        ...columnData,
        tags: tagIds
          ? {
              create: tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      slug?: string;
      content?: string;
      excerpt?: string;
      thumbnailUrl?: string;
      status?: ColumnStatus;
      categoryId?: string | null;
      tagIds?: string[];
      publishedAt?: Date | null;
    }
  ): Promise<Column | null> {
    const { tagIds, ...updateData } = data;

    try {
      // If tagIds provided, replace all tags
      if (tagIds !== undefined) {
        // Delete existing tags
        await this.prisma.columnTag.deleteMany({
          where: { columnId: id },
        });

        // Create new tags
        if (tagIds.length > 0) {
          await this.prisma.columnTag.createMany({
            data: tagIds.map((tagId) => ({
              columnId: id,
              tagId,
            })),
          });
        }
      }

      return await this.prisma.column.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.column.delete({
      where: { id },
    });
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.prisma.column.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }
}

