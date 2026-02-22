import ColumnModel, {
  ColumnCreationAttributes,
  ColumnStatus,
  ColumnAttributes,
} from '../models/Column';
import { Op, WhereOptions } from 'sequelize';

/**
 * Sequelize 모델을 타입 안전하게 사용
 */
const Column = ColumnModel;

export interface ColumnWithRelations {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  thumbnailUrl: string | null;
  status: ColumnStatus;
  authorId: string;
  categoryId: string | null;
  viewCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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
}

export interface FindColumnsOptions {
  status?: ColumnStatus;
  categoryId?: string;
  search?: string;
  authorId?: string;
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'publishedAt' | 'viewCount' | 'title';
  orderDirection?: 'asc' | 'desc';
}

export const ColumnRepo = {
  /**
   * 칼럼 목록 조회
   */
  async findMany(options: FindColumnsOptions = {}): Promise<{
    columns: ColumnWithRelations[];
    total: number;
  }> {
    const {
      status,
      categoryId,
      search,
      authorId,
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = options;

    const skip = (page - 1) * limit;
    const where: WhereOptions<ColumnAttributes> = {};

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      (where as Record<string, unknown>)[Op.or as unknown as string] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const [columns, total] = await Promise.all([
      Column.findAll({
        where,
        offset: skip,
        limit,
        order: [[orderBy, orderDirection.toUpperCase()]],
        include: [
          {
            association: 'author',
            attributes: ['id', 'name', 'email'],
            required: true,
          },
          {
            association: 'category',
            attributes: ['id', 'name', 'slug'],
            required: false,
          },
        ],
      }),
      Column.count({ where }),
    ]);

    const transformedColumns: ColumnWithRelations[] = columns.map(column => {
      const columnData = column.get() as ColumnAttributes & {
        author?: { id: string; name: string; email: string };
        category?: { id: string; name: string; slug: string } | null;
      };
      return {
        ...columnData,
        author: columnData.author!,
        category: columnData.category || null,
      } as ColumnWithRelations;
    });

    return {
      columns: transformedColumns,
      total,
    };
  },

  /**
   * ID로 칼럼 조회
   */
  async findById(id: string): Promise<ColumnWithRelations | null> {
    const column = await Column.findByPk(id, {
      include: [
        {
          association: 'author',
          attributes: ['id', 'name', 'email'],
          required: true,
        },
        {
          association: 'category',
          attributes: ['id', 'name', 'slug'],
          required: false,
        },
      ],
    });

    if (!column) return null;

    const columnData = column.get() as ColumnAttributes & {
      author: { id: string; name: string; email: string };
      category: { id: string; name: string; slug: string } | null;
    };
    return {
      ...columnData,
      author: columnData.author,
      category: columnData.category || null,
    } as ColumnWithRelations;
  },

  /**
   * Slug로 칼럼 조회
   */
  async findBySlug(slug: string): Promise<ColumnWithRelations | null> {
    const column = await Column.findOne({
      where: { slug },
      include: [
        {
          association: 'author',
          attributes: ['id', 'name', 'email'],
          required: true,
        },
        {
          association: 'category',
          attributes: ['id', 'name', 'slug'],
          required: false,
        },
      ],
    });

    if (!column) return null;

    const columnData = column.get() as ColumnAttributes & {
      author: { id: string; name: string; email: string };
      category: { id: string; name: string; slug: string } | null;
    };
    return {
      ...columnData,
      author: columnData.author,
      category: columnData.category || null,
    } as ColumnWithRelations;
  },

  /**
   * 칼럼 생성
   */
  async create(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    thumbnailUrl?: string;
    status: ColumnStatus;
    authorId: string;
    categoryId?: string;
    publishedAt?: Date;
  }) {
    const column = await Column.create(data as ColumnCreationAttributes);
    return column.get();
  },

  /**
   * 칼럼 수정
   */
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
      publishedAt?: Date | null;
    }
  ) {
    const [updated] = await Column.update(data, {
      where: { id },
      returning: true,
    });

    if (updated === 0) {
      return null;
    }

    const column = await Column.findByPk(id);
    return column ? column.get() : null;
  },

  /**
   * 칼럼 삭제
   */
  async delete(id: string) {
    const deleted = await Column.destroy({ where: { id } });
    if (deleted === 0) {
      throw new Error('Column not found');
    }
  },

  /**
   * 조회수 증가
   */
  async incrementViewCount(id: string) {
    await Column.increment('viewCount', {
      where: { id },
    });
  },
};
