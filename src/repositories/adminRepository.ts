import AdminModel, { AdminCreationAttributes } from '../models/Admin';
import { AdminRole } from '../models/Admin';

export const AdminRepo = {
  /**
   * 이메일로 어드민 조회
   */
  async findByEmail(email: string) {
    const admin = await AdminModel.findOne({
      where: { email },
    });
    return admin ? admin.get() : null;
  },

  /**
   * ID로 어드민 조회 (비밀번호 제외)
   */
  async findById(id: string) {
    const admin = await AdminModel.findByPk(id, {
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
    const admin = await AdminModel.create(data);
    return admin.get();
  },

  /**
   * 마지막 로그인 시간 업데이트
   */
  async updateLastLogin(id: string) {
    await AdminModel.update(
      { lastLoginAt: new Date() },
      { where: { id } }
    );
  },
};
