import { PrismaClient, Media, Prisma } from '@prisma/client';

export class MediaRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(options?: {
    uploadedBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ media: Media[]; total: number }> {
    const { uploadedBy, page = 1, limit = 20 } = options || {};
    const skip = (page - 1) * limit;

    const where: Prisma.MediaWhereInput = {};
    if (uploadedBy) {
      where.uploadedBy = uploadedBy;
    }

    const [media, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.media.count({ where }),
    ]);

    return { media, total };
  }

  async findById(id: string): Promise<Media | null> {
    return await this.prisma.media.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async create(data: {
    originalName: string;
    fileName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedBy: string;
  }): Promise<Media> {
    return await this.prisma.media.create({
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.media.delete({
      where: { id },
    });
  }
}

