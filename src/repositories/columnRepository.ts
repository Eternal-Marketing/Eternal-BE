import ColumnModel, {
  ColumnCreationAttributes,
  ColumnStatus,
  ColumnAttributes,
} from '../models/Column';
import ColumnTagModel, { ColumnTagAttributes } from '../models/ColumnTag';
import TagModel, { TagAttributes } from '../models/Tag';
import { Op, WhereOptions } from 'sequelize';

/**
 * Sequelize 모델을 타입 안전하게 사용
 */
const Column = ColumnModel;
const ColumnTag = ColumnTagModel;
const Tag = TagModel;

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
      tagId,
      search,
      authorId,
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = options;

    // 페이지네이션: 건너뛸 레코드 수 계산
    const skip = (page - 1) * limit;

    /**
     * Sequelize where 조건 객체
     * 동적으로 검색 조건을 추가하기 위해 WhereOptions 타입 사용
     * status, categoryId, authorId, search 등 다양한 필터 조건 지원
     */
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
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // 태그 필터링이 있는 경우
    if (tagId) {
      const columnTags = await ColumnTag.findAll({
        where: { tagId },
        attributes: ['columnId'],
      });
      const columnIds = columnTags.map(ct => ct.columnId);
      where.id = { [Op.in]: columnIds };
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
          {
            association: 'tags',
            include: [
              {
                association: 'tag',
                attributes: ['id', 'name', 'slug'],
                required: true,
              },
            ],
            required: false,
          },
        ],
      }),
      Column.count({ where }),
    ]);

    /**
     * Sequelize include로 가져온 태그 데이터를 변환
     * ColumnTag 모델을 통해 Tag 모델이 포함되어 있으므로 구조를 변환
     */
    const transformedColumns: ColumnWithRelations[] = columns.map(column => {
      const columnData = column.get() as ColumnAttributes & {
        author?: { id: string; name: string; email: string };
        category?: { id: string; name: string; slug: string } | null;
        tags?: Array<{
          tag: TagAttributes;
        }>;
      };

      // 태그 배열을 평탄화 (ColumnTag -> Tag)
      const tags: TagAttributes[] = columnData.tags
        ? columnData.tags.map(ct => ct.tag)
        : [];

      return {
        ...columnData,
        author: columnData.author!,
        category: columnData.category || null,
        tags,
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
        {
          association: 'tags',
          include: [
            {
              association: 'tag',
              attributes: ['id', 'name', 'slug'],
              required: true,
            },
          ],
          required: false,
        },
      ],
    });

    if (!column) return null;

    /**
     * Sequelize include로 가져온 데이터 변환
     */
    const columnData = column.get() as ColumnAttributes & {
      author: { id: string; name: string; email: string };
      category: { id: string; name: string; slug: string } | null;
      tags?: Array<{ tag: TagAttributes }>;
    };

    const tags: TagAttributes[] = columnData.tags
      ? columnData.tags.map(ct => ct.tag)
      : [];

    return {
      ...columnData,
      author: columnData.author,
      category: columnData.category || null,
      tags,
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
        {
          association: 'tags',
          include: [
            {
              association: 'tag',
              attributes: ['id', 'name', 'slug'],
              required: true,
            },
          ],
          required: false,
        },
      ],
    });

    if (!column) return null;

    /**
     * Sequelize include로 가져온 데이터 변환
     */
    const columnData = column.get() as ColumnAttributes & {
      author: { id: string; name: string; email: string };
      category: { id: string; name: string; slug: string } | null;
      tags?: Array<{ tag: TagAttributes }>;
    };

    const tags: TagAttributes[] = columnData.tags
      ? columnData.tags.map(ct => ct.tag)
      : [];

    return {
      ...columnData,
      author: columnData.author,
      category: columnData.category || null,
      tags,
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
    tagIds?: string[];
    publishedAt?: Date;
  }) {
    const { tagIds, ...columnData } = data;

    const column = await Column.create(columnData as ColumnCreationAttributes);

    // 태그 연결
    if (tagIds && tagIds.length > 0) {
      await ColumnTag.bulkCreate(
        tagIds.map(tagId => ({
          columnId: column.id,
          tagId,
        }))
      );
    }

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
      tagIds?: string[];
      publishedAt?: Date | null;
    }
  ) {
    const { tagIds, ...updateData } = data;

    // 태그 업데이트
    if (tagIds !== undefined) {
      // 기존 태그 삭제
      await ColumnTag.destroy({
        where: { columnId: id },
      });

      // 새 태그 생성
      if (tagIds.length > 0) {
        await ColumnTag.bulkCreate(
          tagIds.map(tagId => ({
            columnId: id,
            tagId,
          }))
        );
      }
    }

    const [updated] = await Column.update(updateData, {
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
