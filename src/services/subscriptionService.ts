import { SubscriptionRepo } from '../repositories/subscriptionRepository';
import {
  SubscriptionCreationAttributes,
  SubscriptionStatus,
} from '../models/Subscription';
import { AppError } from '../middleware/errorHandler';
import ENV from '../common/constants/ENV';
import Logger from '../utils/logger';

/**
 * Subscription 서비스
 * 상담신청 및 가입자 관리 비즈니스 로직을 담당
 */
export class SubscriptionService {
  /**
   * 상담신청 생성 (공개 API)
   * 사용자가 홈페이지에서 상담신청을 제출하면 자동으로 PENDING 상태로 생성됨
   * @param data - 상담신청 정보 (이름, 이메일, 전화번호, 메시지)
   * @returns 생성된 상담신청 정보
   */
  async createSubscription(data: SubscriptionCreationAttributes) {
    Logger.debug('상담신청 생성 시작', { email: data.email, name: data.name });

    const subscription = await SubscriptionRepo.create({
      ...data,
      status: SubscriptionStatus.PENDING,
    });

    Logger.info('상담신청 생성 완료', {
      id: subscription.id,
      email: subscription.email,
    });

    return subscription;
  }

  /**
   * 총 가입자 수 조회 (공개 API)
   * 홈페이지 하단에 표시할 총 가입자 수를 계산
   *
   * 계산 공식: 출범 이전 사용자 수(환경변수) + 승인된 가입자 수(DB)
   *
   * @returns 총 가입자 수
   */
  async getTotalSubscriberCount() {
    Logger.debug('총 가입자 수 조회 시작');

    // 출범 이전 사용자 수 (환경변수에서 가져옴)
    const initialCount = ENV.InitialSubscriberCount;

    // 승인된 가입자 수 (데이터베이스에서 가져옴)
    const approvedCount = await SubscriptionRepo.getTotalCount();

    // 총 가입자 수 = 출범 이전 사용자 수 + 승인된 가입자 수
    const totalCount = initialCount + approvedCount;

    Logger.debug('총 가입자 수 조회 완료', {
      initialCount,
      approvedCount,
      totalCount,
    });

    return totalCount;
  }

  /**
   * 상담신청 목록 조회 (어드민용)
   */
  async getSubscriptions(options?: {
    status?: SubscriptionStatus;
    limit?: number;
    offset?: number;
  }) {
    return await SubscriptionRepo.findMany(options);
  }

  /**
   * 상담신청 상세 조회 (어드민용)
   */
  async getSubscriptionById(id: string) {
    const subscription = await SubscriptionRepo.findById(id);

    if (!subscription) {
      const error = new Error('Subscription not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    return subscription;
  }

  /**
   * 상담신청 상태 업데이트 (어드민용)
   */
  async updateSubscriptionStatus(id: string, status: SubscriptionStatus) {
    const subscription = await SubscriptionRepo.findById(id);

    if (!subscription) {
      const error = new Error('Subscription not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    return await SubscriptionRepo.updateStatus(id, status);
  }

  /**
   * 상담신청 삭제 (어드민용)
   */
  async deleteSubscription(id: string) {
    const subscription = await SubscriptionRepo.findById(id);

    if (!subscription) {
      const error = new Error('Subscription not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    await SubscriptionRepo.delete(id);
  }
}
