import SubscriptionModel, {
  SubscriptionCreationAttributes,
  SubscriptionStatus,
} from '../models/Subscription';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Subscription = SubscriptionModel as any;

export const SubscriptionRepo = {
  /**
   * 상담신청 생성
   */
  async create(data: SubscriptionCreationAttributes) {
    const subscription = await Subscription.create(data);
    return subscription.get();
  },

  /**
   * ID로 상담신청 조회
   */
  async findById(id: string) {
    const subscription = await Subscription.findByPk(id);
    return subscription ? subscription.get() : null;
  },

  /**
   * 이메일로 상담신청 조회
   */
  async findByEmail(email: string) {
    const subscription = await Subscription.findOne({
      where: { email },
      order: [['createdAt', 'DESC']],
    });
    return subscription ? subscription.get() : null;
  },

  /**
   * 상담신청 목록 조회 (어드민용)
   */
  async findMany(options?: {
    status?: SubscriptionStatus;
    limit?: number;
    offset?: number;
  }) {
    const where: { status?: SubscriptionStatus } = {};
    if (options?.status) {
      where.status = options.status;
    }

    const subscriptions = await Subscription.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: options?.limit,
      offset: options?.offset,
    });

    return subscriptions.map(sub => sub.get());
  },

  /**
   * 총 가입자 수 조회 (APPROVED 상태만)
   */
  async getTotalCount() {
    const count = await Subscription.count({
      where: { status: SubscriptionStatus.APPROVED },
    });
    return count;
  },

  /**
   * 상담신청 상태 업데이트
   */
  async updateStatus(id: string, status: SubscriptionStatus) {
    const [updated] = await Subscription.update(
      { status },
      {
        where: { id },
        returning: true,
      }
    );

    if (updated === 0) {
      return null;
    }

    const subscription = await Subscription.findByPk(id);
    return subscription ? subscription.get() : null;
  },

  /**
   * 상담신청 삭제
   */
  async delete(id: string) {
    const deleted = await Subscription.destroy({ where: { id } });
    if (deleted === 0) {
      throw new Error('Subscription not found');
    }
  },
};
