import { SolapiMessageService } from 'solapi';
import ENV from '../common/constants/ENV';
import Logger from '../utils/logger';

const { SolapiApiKey, SolapiApiSecret } = ENV;

let solapi: SolapiMessageService | null = null;

if (SolapiApiKey && SolapiApiSecret) {
  solapi = new SolapiMessageService(SolapiApiKey, SolapiApiSecret);
  Logger.info('[Solapi] MessageService 초기화 완료');
} else {
  Logger.warn(
    '[Solapi] SOLAPI_API_KEY 또는 SOLAPI_API_SECRET 이 설정되지 않았습니다. 메시지는 실제로 전송되지 않습니다.'
  );
}

export function getSolapiClient(): SolapiMessageService | null {
  return solapi;
}
