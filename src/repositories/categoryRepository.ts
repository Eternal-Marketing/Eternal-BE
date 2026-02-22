import { fn, col } from 'sequelize';
import CategoryModel, {
  CategoryCreationAttributes,
  CategoryAttributes,
} from '../models/Category';
import ColumnModel from '../models/Column';

/**
 * Sequelize 모델을 타입 안전하게 사용
 */
const Category = CategoryModel;

export const CategoryRepo = {
  /**
   * 카테고리 목록 조회
   * 칼럼 수는 쿼리에서 한 번에 집계 (N+1 방지)
   */
  async findMany(includeInactive = false) {
    const where: { isActive?: boolean } = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const categories = await Category.findAll({
      where,
      order: [
        ['order', 'ASC'],
        ['createdAt', 'DESC'],
      ],
      include: [
        {
          association: 'parent',
          attributes: ['id', 'name', 'slug'],
          required: false,
        },
      ],
    });

    if (categories.length === 0) {
      return [];
    }

    // 카테고리별 칼럼 수를 한 번의 GROUP BY 쿼리로 조회
    const countRows = await ColumnModel.findAll({
      attributes: ['categoryId', [fn('COUNT', col('id')), 'count']],
      where: {
        categoryId: categories.map(c => (c.get() as CategoryAttributes).id),
      },
      group: ['categoryId'],
      raw: true,
    });

    type CountRow = {
      category_id?: string;
      categoryId?: string;
      count: string;
    };
    const countByCategoryId = new Map<string, number>(
      (countRows as unknown as CountRow[]).map(row => [
        row.category_id ?? row.categoryId ?? '',
        Number(row.count),
      ])
    );

    return categories.map(category => {
      const categoryData = category.get() as CategoryAttributes;
      return {
        ...categoryData,
        _count: {
          columns: countByCategoryId.get(categoryData.id) ?? 0,
        },
      };
    });
  },

  /**
   * ID로 카테고리 조회
   */
  async findById(id: string) {
    const category = await Category.findByPk(id, {
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

    const categoryData = category.get() as CategoryAttributes;
    const count = await ColumnModel.count({
      where: { categoryId: categoryData.id },
    });
    return {
      ...categoryData,
      _count: { columns: count },
    };
  },

  /**
   * Slug로 카테고리 조회
   */
  async findBySlug(slug: string) {
    const category = await Category.findOne({
      where: { slug },
    });
    return category ? category.get() : null;
  },

  /**
   * 카테고리 생성
   */
  async create(data: CategoryCreationAttributes) {
    const category = await Category.create(data);
    return category.get();
  },

  /**
   * 카테고리 수정
   */
  async update(id: string, data: Partial<CategoryCreationAttributes>) {
    const [updated] = await Category.update(data, {
      where: { id },
      returning: true,
    });

    if (updated === 0) {
      return null;
    }

    const category = await Category.findByPk(id);
    return category ? category.get() : null;
  },

  /**
   * 카테고리 삭제
   */
  async delete(id: string) {
    const deleted = await Category.destroy({ where: { id } });
    if (deleted === 0) {
      throw new Error('Category not found');
    }
  },
};
