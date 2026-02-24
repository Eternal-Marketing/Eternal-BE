/**
 * [당일 진단 건수 표시] 표시값 계산 + 설정 조회/변경
 * - 검증: 자정(00:00 UTC)이면 0, 하루가 지날수록 max 근처까지 증가. 같은 분이면 같은 값(시드 고정).
 */
import { SiteSettingRepo } from '../repositories/siteSettingRepository';

/** 당일 00:00 UTC 기준 진행률 (0~1). 자정이면 0. */
function getTodayProgressUTC(): number {
  const now = new Date();
  const start = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
  const elapsed = now.getTime() - start.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.min(1, elapsed / dayMs);
}

function getMinuteSeed(): number {
  const now = new Date();
  const n =
    now.getUTCFullYear() * 372 +
    (now.getUTCMonth() + 1) * 31 +
    now.getUTCDate() +
    now.getUTCHours() * 60 +
    now.getUTCMinutes();
  return n % 2;
}

export class StatsService {
  async getDailyDiagnosticCount(): Promise<{ count: number }> {
    const max = await SiteSettingRepo.getDailyDiagnosticMax();
    const progress = getTodayProgressUTC();
    if (progress <= 0) {
      return { count: 0 };
    }
    const base = Math.floor(progress * (max + 0.5)); // 진행률에 따라 0~max 근처
    const add = getMinuteSeed(); // 0 또는 1
    const count = Math.min(max, base + add);
    return { count };
  }

  async getDailyDiagnosticMax(): Promise<{ max: number }> {
    const max = await SiteSettingRepo.getDailyDiagnosticMax();
    return { max };
  }

  async setDailyDiagnosticMax(max: number): Promise<{ max: number }> {
    const value = await SiteSettingRepo.setDailyDiagnosticMax(max);
    return { max: value };
  }
}
