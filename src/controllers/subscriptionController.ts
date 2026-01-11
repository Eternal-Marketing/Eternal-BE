import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscriptionService';
import { SubscriptionStatus } from '../models/Subscription';
import HttpStatusCodes from '../common/constants/HttpStatusCodes';

/**
 * 상담신청 생성 (공개 API)
 * POST /api/subscriptions
 */
export async function createSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Name and email are required',
      });
      return;
    }

    const subscriptionService = new SubscriptionService();
    const subscription = await subscriptionService.createSubscription({
      name,
      email,
      phone,
      message,
    });

    res.status(HttpStatusCodes.CREATED).json({
      status: 'success',
      message: 'Consultation request submitted successfully',
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 총 가입자 수 조회 (공개 API)
 * GET /api/subscriptions/count
 */
export async function getTotalSubscriberCount(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const subscriptionService = new SubscriptionService();
    const count = await subscriptionService.getTotalSubscriberCount();

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { totalCount: count },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 상담신청 목록 조회 (어드민용)
 * GET /api/subscriptions
 */
export async function getSubscriptions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { status, limit, offset } = req.query;

    const subscriptionService = new SubscriptionService();
    const subscriptions = await subscriptionService.getSubscriptions({
      status: status as SubscriptionStatus | undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { subscriptions },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 상담신청 상세 조회 (어드민용)
 * GET /api/subscriptions/:id
 */
export async function getSubscriptionById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const subscriptionService = new SubscriptionService();
    const subscription = await subscriptionService.getSubscriptionById(id);

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 상담신청 상태 업데이트 (어드민용)
 * PATCH /api/subscriptions/:id/status
 */
export async function updateSubscriptionStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(SubscriptionStatus).includes(status)) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Valid status is required',
      });
      return;
    }

    const subscriptionService = new SubscriptionService();
    const subscription = await subscriptionService.updateSubscriptionStatus(
      id,
      status as SubscriptionStatus
    );

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      message: 'Subscription status updated successfully',
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 상담신청 삭제 (어드민용)
 * DELETE /api/subscriptions/:id
 */
export async function deleteSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const subscriptionService = new SubscriptionService();
    await subscriptionService.deleteSubscription(id);

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      message: 'Subscription deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
