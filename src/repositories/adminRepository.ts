import AdminModel, { AdminCreationAttributes } from '../models/Admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Admin = AdminModel as any;

export const AdminRepo = {
  /**
   * 이메일로 어드민 조회
   */
  async findByEmail(email: string) {
    const admin = await Admin.findOne({
      where: { email },
    });
    return admin ? admin.get() : null;
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
    return admin ? admin.get() : null;
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
