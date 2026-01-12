import AdminModel, {
  AdminCreationAttributes,
  AdminAttributes,
} from '../models/Admin';

/**
 * Sequelize 모델을 타입 안전하게 사용
 */
const Admin = AdminModel;

export const AdminRepo = {
  /**
   * 이메일로 어드민 조회 (비밀번호 포함)
   * 로그인 시 비밀번호 검증을 위해 사용
   */
  async findByEmail(email: string): Promise<AdminAttributes | null> {
    const admin = await Admin.findOne({
      where: { email },
    });
    return admin ? (admin.get() as AdminAttributes) : null;
  },

  /**
   * ID로 어드민 조회 (비밀번호 제외)
   */
  async findById(id: string) {
    const admin = await Admin.findByPk(id, {
      attributes: {
        exclude: ['password'],
      },
    });
    return admin ? (admin.get() as Omit<AdminAttributes, 'password'>) : null;
  },

  /**
   * 어드민 생성
   */
  async create(data: AdminCreationAttributes) {
    const admin = await Admin.create(data);
    return admin.get();
  },

  /**
   * 마지막 로그인 시간 업데이트
   */
  async updateLastLogin(id: string) {
    await Admin.update({ lastLoginAt: new Date() }, { where: { id } });
  },
};
