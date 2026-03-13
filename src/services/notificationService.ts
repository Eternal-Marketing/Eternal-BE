import { getSolapiClient } from '../infra/solapiClient';
import type { AppError } from '../middleware/errorHandler';
import type { SubscriptionAttributes } from '../models/Subscription';
import ENV from '../common/constants/ENV';
import Logger from '../utils/logger';

interface SendSmsParams {
  to: string; // 수신자 번호 (예: 01012345678)
  from: string; // 발신번호 (솔라피에 등록된 번호)
  text: string;
}

interface SendSmsOptions extends SendSmsParams {
  strictClient: boolean;
  context: 'test' | 'consultation';
}

type ConsultationSmsPayload = Pick<
  SubscriptionAttributes,
  | 'id'
  | 'name'
  | 'phone'
  | 'region'
  | 'companyName'
  | 'contactTimeSlots'
  | 'contactTimeOther'
>;

/**
 * SMS / 알림 발송 관련 서비스
 * - 현재는 Solapi SMS 단일 기능만 제공
 * - 나중에 Kakao 알림톡 등으로 확장 가능
 */
export class NotificationService {
  async sendTestSms({ to, from, text }: SendSmsParams) {
    return await this.sendSms({
      to,
      from,
      text,
      strictClient: false,
      context: 'test',
    });
  }

  async sendConsultationRequestSms(payload: ConsultationSmsPayload) {
    const to = this.normalizePhone(ENV.SolapiConsultationReceiverNumber);
    const from = this.normalizePhone(ENV.SolapiSenderNumber);

    if (!to) {
      throw this.buildConfigError(
        'SOLAPI_CONSULTATION_RECEIVER_NUMBER가 설정되지 않았습니다.'
      );
    }

    if (!from) {
      throw this.buildConfigError('SOLAPI_SENDER_NUMBER가 설정되지 않았습니다.');
    }

    const text = this.buildConsultationRequestText(payload);

    return await this.sendSms({
      to,
      from,
      text,
      strictClient: true,
      context: 'consultation',
    });
  }

  private async sendSms({
    to,
    from,
    text,
    strictClient,
    context,
  }: SendSmsOptions) {
    const client = getSolapiClient();

    if (!client) {
      const message = '[NotificationService] Solapi 클라이언트가 초기화되지 않았습니다.';
      Logger.warn(message, { context });

      if (strictClient) {
        throw this.buildConfigError(
          'SOLAPI_API_KEY 또는 SOLAPI_API_SECRET이 설정되지 않았습니다.'
        );
      }
      return { skipped: true };
    }

    Logger.info('[NotificationService] SMS 발송 시도', { to, from, context });

    try {
      const response = await client.send({
        to,
        from,
        text,
      });

      Logger.info('[NotificationService] SMS 발송 완료', {
        to,
        messageId: response?.groupInfo?.groupId,
        context,
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
        context,
        ...(failedMessageList ? { failedMessageList } : {}),
      };
      throw appError;
    }
  }

  private buildConsultationRequestText(payload: ConsultationSmsPayload): string {
    const timeSlots = payload.contactTimeSlots?.join(', ') || '-';
    const timeOther = payload.contactTimeOther || '-';

    return [
      '[새 상담신청]',
      `이름: ${payload.name}`,
      `연락처: ${payload.phone || '-'}`,
      `지역: ${payload.region || '-'}`,
      `업체명: ${payload.companyName || '-'}`,
      `연락가능시간: ${timeSlots}`,
      `기타시간: ${timeOther}`,
      `신청ID: ${payload.id}`,
    ].join('\n');
  }

  private normalizePhone(value: string): string {
    return value.replace(/\D/g, '');
  }

  private buildConfigError(message: string): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = 500;
    error.status = 'error';
    error.details = { provider: 'solapi' };
    return error;
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
