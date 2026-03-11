import { Request, Response, NextFunction } from 'express';
import HttpStatusCodes from '../common/constants/HttpStatusCodes';
import { NotificationService } from '../services/notificationService';
import ENV from '../common/constants/ENV';

function normalizePhone(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\D/g, '');
}

/**
 * 테스트용 SMS 발송 컨트롤러
 * - POST /api/notifications/sms/test
 * - Body: { to: string; from: string; text?: string }
 */
export async function sendTestSms(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { to, from, text } = req.body ?? {};
    const normalizedTo = normalizePhone(to);
    const normalizedFromInput = normalizePhone(from);
    const normalizedConfiguredSender = normalizePhone(ENV.SolapiSenderNumber);

    if (!normalizedTo) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'to 필드가 필요합니다.',
      });
      return;
    }

    let senderNumber = normalizedFromInput;

    if (normalizedConfiguredSender) {
      if (
        normalizedFromInput &&
        normalizedFromInput !== normalizedConfiguredSender
      ) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          status: 'error',
          message: 'from 번호가 서버에 설정된 발신번호와 일치하지 않습니다.',
          details: {
            configuredSender: normalizedConfiguredSender,
          },
        });
        return;
      }

      senderNumber = normalizedConfiguredSender;
    } else if (!normalizedFromInput) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message:
          'from 필드가 필요합니다. 또는 서버에 SOLAPI_SENDER_NUMBER를 설정하세요.',
      });
      return;
    }

    const notificationService = new NotificationService();
    const result = await notificationService.sendTestSms({
      to: normalizedTo,
      from: senderNumber,
      text: text || 'Solapi SMS 테스트 메시지입니다.',
    });

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
