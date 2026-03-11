import { getSolapiClient } from '../infra/solapiClient';
import type { AppError } from '../middleware/errorHandler';
import Logger from '../utils/logger';

interface SendSmsParams {
  to: string; // 수신자 번호 (예: 01012345678)
  from: string; // 발신번호 (솔라피에 등록된 번호)
  text: string;
}

/**
 * SMS / 알림 발송 관련 서비스
 * - 현재는 Solapi SMS 단일 기능만 제공
 * - 나중에 Kakao 알림톡 등으로 확장 가능
 */
export class NotificationService {
  async sendTestSms({ to, from, text }: SendSmsParams) {
    const client = getSolapiClient();

    if (!client) {
      Logger.warn('[NotificationService] Solapi 클라이언트가 초기화되지 않았습니다.');
      return { skipped: true };
    }

    Logger.info('[NotificationService] SMS 발송 시도', { to, from });

    try {
      const response = await client.send({
        to,
        from,
        text,
      });

      Logger.info('[NotificationService] SMS 발송 완료', {
        to,
        messageId: response?.groupInfo?.groupId,
      });

      return response;
    } catch (error) {
      const failedMessageList = this.extractFailedMessageList(error);
      const providerMessage = this.extractProviderMessage(error);

      Logger.error('[NotificationService] SMS 발송 실패', error);
      if (failedMessageList) {
        Logger.warn('[NotificationService] Solapi failedMessageList', {
          failedMessageList,
        });
      }

      const appError = new Error(
        providerMessage || 'SMS 발송 중 오류가 발생했습니다.'
      ) as AppError;
      appError.statusCode = failedMessageList ? 400 : 502;
      appError.status = 'error';
      appError.details = {
        provider: 'solapi',
        ...(failedMessageList ? { failedMessageList } : {}),
      };
      throw appError;
    }
  }

  private extractProviderMessage(error: unknown): string | undefined {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    const responseMessage = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    if (typeof responseMessage === 'string' && responseMessage.length > 0) {
      return responseMessage;
    }

    return undefined;
  }

  private extractFailedMessageList(error: unknown): unknown[] | undefined {
    const directList = (error as { failedMessageList?: unknown })?.failedMessageList;
    if (Array.isArray(directList)) {
      return directList;
    }

    const responseList = (
      error as { response?: { data?: { failedMessageList?: unknown } } }
    )?.response?.data?.failedMessageList;
    if (Array.isArray(responseList)) {
      return responseList;
    }

    const bodyList = (error as { body?: { failedMessageList?: unknown } })?.body
      ?.failedMessageList;
    if (Array.isArray(bodyList)) {
      return bodyList;
    }

    return undefined;
  }
}
