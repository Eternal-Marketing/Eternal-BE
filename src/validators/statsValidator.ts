/**
 * [당일 진단 건수 표시] PATCH /api/settings/daily-diagnostic-max body 검증
 * - 검증: max 필수, 숫자, 0~999 정수.
 */
export type UpdateDailyDiagnosticMaxResult =
  | { success: true; max: number }
  | { success: false; message: string };

const MIN = 0;
const MAX = 999;

export function validateUpdateDailyDiagnosticMaxBody(
  body: unknown
): UpdateDailyDiagnosticMaxResult {
  const b =
    typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const raw = b.max;

  if (raw === undefined || raw === null) {
    return { success: false, message: 'max 필드가 필요합니다.' };
  }
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (Number.isNaN(n) || !Number.isFinite(n)) {
    return { success: false, message: 'max는 숫자여야 합니다.' };
  }
  const value = Math.floor(n);
  if (value < MIN || value > MAX) {
    return {
      success: false,
      message: `max는 ${MIN} 이상 ${MAX} 이하여야 합니다.`,
    };
  }
  return { success: true, max: value };
}
