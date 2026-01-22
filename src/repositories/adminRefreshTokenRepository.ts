import AdminRefreshTokenModel, {
  AdminRefreshTokenAttributes,
  AdminRefreshTokenCreationAttributes,
} from '../models/AdminRefreshToken';

/**
 * Refresh Token DB 접근 레이어
 * - 서비스 계층에서 토큰 저장/조회 시 이 레포지토리만 사용
 */
const AdminRefreshToken = AdminRefreshTokenModel;

export const AdminRefreshTokenRepo = {
  /**
   * Refresh Token 저장
   * 로그인 성공 시 호출되어 토큰을 DB에 기록함
   */
  async create(data: AdminRefreshTokenCreationAttributes) {
    const token = await AdminRefreshToken.create(data);
    return token.get() as AdminRefreshTokenAttributes;
  },

  /**
   * Refresh Token 문자열로 조회
   * /api/auth/refresh 요청 시 "이 토큰이 서버에 저장된 적 있는가?" 확인
   */
  async findByToken(
    token: string
  ): Promise<AdminRefreshTokenAttributes | null> {
    const row = await AdminRefreshToken.findOne({
      where: { token },
    });
    return row ? (row.get() as AdminRefreshTokenAttributes) : null;
  },

  async deleteByToken(token: string): Promise<number> {
    return await AdminRefreshToken.destroy({
      where: { token },
    });
  },
};
