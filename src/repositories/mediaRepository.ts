import MediaModel, { MediaCreationAttributes } from '../models/Media';

/**
 * Sequelize 모델을 타입 안전하게 사용
 */
const Media = MediaModel;

export const MediaRepo = {
  /**
   * 미디어 목록 조회
   */
  async findMany(options?: {
    uploadedBy?: string;
    page?: number;
    limit?: number;
  }) {
    const { uploadedBy, page = 1, limit = 20 } = options || {};
    const skip = (page - 1) * limit;

    const where: { uploadedBy?: string } = {};
    if (uploadedBy) {
      where.uploadedBy = uploadedBy;
    }

    const [media, total] = await Promise.all([
      Media.findAll({
        where,
        offset: skip,
        limit,
        order: [['createdAt', 'DESC']],
        include: [
          {
            association: 'uploader',
            attributes: ['id', 'name', 'email'],
            required: true,
          },
        ],
      }),
      Media.count({ where }),
    ]);

    return {
      media: media.map(m => m.get()),
      total,
    };
  },

  /**
   * ID로 미디어 조회
   */
  async findById(id: string) {
    const media = await Media.findByPk(id, {
      include: [
        {
          association: 'uploader',
          attributes: ['id', 'name', 'email'],
          required: true,
        },
      ],
    });
    return media ? media.get() : null;
  },

  /**
   * 미디어 생성
   */
  async create(data: MediaCreationAttributes) {
    const media = await Media.create(data);
    return media.get();
  },

  /**
   * 미디어 삭제
   */
  async delete(id: string) {
    const deleted = await Media.destroy({ where: { id } });
    if (deleted === 0) {
      throw new Error('Media not found');
    }
  },
};
