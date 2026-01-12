import TagModel, { TagCreationAttributes, TagAttributes } from '../models/Tag';
import ColumnTagModel from '../models/ColumnTag';

/**
 * Sequelize 모델을 타입 안전하게 사용
 */
const Tag = TagModel;
const ColumnTag = ColumnTagModel;

export interface TagWithCount {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    columns: number;
  };
}

export const TagRepo = {
  /**
   * 태그 목록 조회
   */
  async findMany(
    includeCount = false
  ): Promise<TagWithCount[] | TagAttributes[]> {
    const tags = await Tag.findAll({
      order: [['name', 'ASC']],
    });

    if (!includeCount) {
      return tags.map(tag => tag.get() as TagAttributes);
    }

    /**
     * 각 태그의 칼럼 수를 계산하여 _count 추가
     */
    const tagsWithCount: TagWithCount[] = await Promise.all(
      tags.map(async tag => {
        const tagData = tag.get() as TagAttributes;
        const count = await ColumnTag.count({
          where: { tagId: tagData.id },
        });
        return {
          id: tagData.id,
          name: tagData.name,
          slug: tagData.slug,
          createdAt: tagData.createdAt || new Date(),
          updatedAt: tagData.updatedAt || new Date(),
          _count: { columns: count },
        };
      })
    );

    return tagsWithCount;
  },

  /**
   * ID로 태그 조회
   */
  async findById(id: string) {
    const tag = await Tag.findByPk(id);

    if (!tag) return null;

    const count = await ColumnTag.count({
      where: { tagId: id },
    });

    return {
      ...tag.get(),
      _count: { columns: count },
    };
  },

  /**
   * Slug로 태그 조회
   */
  async findBySlug(slug: string) {
    const tag = await Tag.findOne({
      where: { slug },
    });
    return tag ? tag.get() : null;
  },

  /**
   * 이름으로 태그 조회
   */
  async findByName(name: string) {
    const tag = await Tag.findOne({
      where: { name },
    });
    return tag ? tag.get() : null;
  },

  /**
   * 태그 생성
   */
  async create(data: TagCreationAttributes) {
    const tag = await Tag.create(data);
    return tag.get();
  },

  /**
   * 태그 삭제
   */
  async delete(id: string) {
    const deleted = await Tag.destroy({ where: { id } });
    if (deleted === 0) {
      throw new Error('Tag not found');
    }
  },

  /**
   * 태그 찾기 또는 생성
   */
  async findOrCreate(name: string, slug: string) {
    const existing = await this.findByName(name);
    if (existing) {
      return existing;
    }

    return await this.create({ name, slug });
  },
};
