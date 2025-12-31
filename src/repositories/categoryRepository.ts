import CategoryModel, { CategoryCreationAttributes } from '../models/Category';
import { Op } from 'sequelize';

export const CategoryRepo = {
  /**
   * 카테고리 목록 조회
   */
  async findMany(includeInactive = false) {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const categories = await CategoryModel.findAll({
      where,
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
      include: [
        {
          association: 'parent',
          attributes: ['id', 'name', 'slug'],
          required: false,
        },
      ],
    });

    // _count는 별도로 계산
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await category.countColumns();
        return {
          ...category.get(),
          _count: { columns: count },
        };
      })
    );

    return categoriesWithCount;
  },

  /**
   * ID로 카테고리 조회
   */
  async findById(id: string) {
    const category = await CategoryModel.findByPk(id, {
      include: [
        {
          association: 'parent',
          required: false,
        },
        {
          association: 'children',
          required: false,
        },
      ],
    });

    if (!category) return null;

    const count = await category.countColumns();
    return {
      ...category.get(),
      _count: { columns: count },
    };
  },

  /**
   * Slug로 카테고리 조회
   */
  async findBySlug(slug: string) {
    const category = await CategoryModel.findOne({
      where: { slug },
    });
    return category ? category.get() : null;
  },

  /**
   * 카테고리 생성
   */
  async create(data: CategoryCreationAttributes) {
    const category = await CategoryModel.create(data);
    return category.get();
  },

  /**
   * 카테고리 수정
   */
  async update(id: string, data: Partial<CategoryCreationAttributes>) {
    const [updated] = await CategoryModel.update(data, {
      where: { id },
      returning: true,
    });

    if (updated === 0) {
      return null;
    }

    const category = await CategoryModel.findByPk(id);
    return category ? category.get() : null;
  },

  /**
   * 카테고리 삭제
   */
  async delete(id: string) {
    const deleted = await CategoryModel.destroy({ where: { id } });
    if (deleted === 0) {
      throw new Error('Category not found');
    }
  },
};
