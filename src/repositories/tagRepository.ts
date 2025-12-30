import TagModel, { TagCreationAttributes } from '../models/Tag';
import ColumnTagModel from '../models/ColumnTag';

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
  async findMany(includeCount = false): Promise<TagWithCount[] | any[]> {
    const tags = await TagModel.findAll({
      order: [['name', 'ASC']],
    });

    if (!includeCount) {
      return tags.map((tag) => tag.get());
    }

    // _count 포함
    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const count = await ColumnTagModel.count({
          where: { tagId: tag.id },
        });
        return {
          ...tag.get(),
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
    const tag = await TagModel.findByPk(id);

    if (!tag) return null;

    const count = await ColumnTagModel.count({
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
    const tag = await TagModel.findOne({
      where: { slug },
    });
    return tag ? tag.get() : null;
  },

  /**
   * 이름으로 태그 조회
   */
  async findByName(name: string) {
    const tag = await TagModel.findOne({
      where: { name },
    });
    return tag ? tag.get() : null;
  },

  /**
   * 태그 생성
   */
  async create(data: TagCreationAttributes) {
    const tag = await TagModel.create(data);
    return tag.get();
  },

  /**
   * 태그 삭제
   */
  async delete(id: string) {
    const deleted = await TagModel.destroy({ where: { id } });
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
