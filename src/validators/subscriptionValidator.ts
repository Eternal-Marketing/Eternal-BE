import type { SubscriptionFormPayload } from '../common/types/subscription';
import {
  SubscriptionIndustry,
  SubscriptionConcern,
  SubscriptionMarketingStatus,
  SubscriptionChannel,
  SubscriptionContactTimeSlot,
} from '../common/types/subscription';
import { SubscriptionStatus } from '../models/Subscription';

export type ValidationResult =
  | { success: true; payload: SubscriptionFormPayload }
  | { success: false; message: string };

function normalizeBody(body: Record<string, unknown>) {
  return {
    name: body.name as string,
    email: body.email as string,
    phone: body.phone as string | undefined,
    companyName: body.companyName ?? body.company_name,
    industry: body.industry as string | undefined,
    industryOther: body.industryOther ?? body.industry_other,
    concerns: body.concerns as string[] | undefined,
    marketingStatus: body.marketingStatus ?? body.marketing_status,
    interestedChannels: body.interestedChannels ?? body.interested_channels,
    channelsOther: body.channelsOther ?? body.channels_other,
    message: body.message as string | undefined,
    region: body.region as string | undefined,
    contactTimeSlots: body.contactTimeSlots ?? body.contact_time_slots,
    contactTimeOther: body.contactTimeOther ?? body.contact_time_other,
  };
}

function isEnumValue<T extends string>(
  value: unknown,
  allowed: readonly T[]
): value is T {
  return typeof value === 'string' && allowed.includes(value as T);
}

function isEnumArray<T extends string>(
  value: unknown,
  allowed: readonly T[]
): value is T[] {
  if (!Array.isArray(value)) return false;
  return value.every(v => typeof v === 'string' && allowed.includes(v as T));
}

/**
 * 상담신청 body 검증 + 정규화.
 * req.body를 넘기면 SubscriptionFormPayload 또는 에러 메시지를 반환.
 */
export function validateSubscriptionForm(body: unknown): ValidationResult {
  const raw = normalizeBody(
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {}
  );

  if (!raw.name?.trim() || !raw.email?.trim()) {
    return { success: false, message: 'Name and email are required' };
  }

  if (
    raw.industry != null &&
    !isEnumValue(raw.industry, Object.values(SubscriptionIndustry))
  ) {
    return { success: false, message: 'Invalid industry value' };
  }
  if (
    raw.marketingStatus != null &&
    !isEnumValue(
      raw.marketingStatus,
      Object.values(SubscriptionMarketingStatus)
    )
  ) {
    return { success: false, message: 'Invalid marketingStatus value' };
  }
  if (raw.concerns != null) {
    if (!isEnumArray(raw.concerns, Object.values(SubscriptionConcern))) {
      return { success: false, message: 'Invalid concerns value' };
    }
    if (raw.concerns.length > 2) {
      return { success: false, message: 'Concerns allows at most 2 items' };
    }
  }
  if (
    raw.interestedChannels != null &&
    !isEnumArray(raw.interestedChannels, Object.values(SubscriptionChannel))
  ) {
    return { success: false, message: 'Invalid interestedChannels value' };
  }
  if (
    raw.contactTimeSlots != null &&
    !isEnumArray(
      raw.contactTimeSlots,
      Object.values(SubscriptionContactTimeSlot)
    )
  ) {
    return { success: false, message: 'Invalid contactTimeSlots value' };
  }

  const payload: SubscriptionFormPayload = {
    name: raw.name.trim(),
    email: raw.email.trim(),
    phone: raw.phone?.trim(),
    companyName:
      typeof raw.companyName === 'string' ? raw.companyName.trim() : undefined,
    industry: raw.industry as SubscriptionIndustry | undefined,
    industryOther:
      typeof raw.industryOther === 'string'
        ? raw.industryOther.trim()
        : undefined,
    concerns: raw.concerns as SubscriptionConcern[] | undefined,
    marketingStatus: raw.marketingStatus as
      | SubscriptionMarketingStatus
      | undefined,
    interestedChannels: raw.interestedChannels as
      | SubscriptionChannel[]
      | undefined,
    channelsOther:
      typeof raw.channelsOther === 'string'
        ? raw.channelsOther.trim()
        : undefined,
    message: typeof raw.message === 'string' ? raw.message.trim() : undefined,
    region: typeof raw.region === 'string' ? raw.region.trim() : undefined,
    contactTimeSlots: raw.contactTimeSlots as
      | SubscriptionContactTimeSlot[]
      | undefined,
    contactTimeOther:
      typeof raw.contactTimeOther === 'string'
        ? raw.contactTimeOther.trim()
        : undefined,
  };

  return { success: true, payload };
}

export type SubscriptionStatusValidationResult =
  | { success: true; status: SubscriptionStatus }
  | { success: false; message: string };

const SUBSCRIPTION_STATUSES = Object.values(SubscriptionStatus);

export function validateSubscriptionStatusBody(
  body: unknown
): SubscriptionStatusValidationResult {
  const b =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const status = b.status;

  if (!status || typeof status !== 'string') {
    return { success: false, message: 'Valid status is required' };
  }
  if (!SUBSCRIPTION_STATUSES.includes(status as SubscriptionStatus)) {
    return { success: false, message: 'Valid status is required' };
  }

  return { success: true, status: status as SubscriptionStatus };
}
