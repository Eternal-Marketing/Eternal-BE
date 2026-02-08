export enum SubscriptionIndustry {
  RESTAURANT = 'RESTAURANT', // 음식점
  HOSPITAL = 'HOSPITAL', // 병원·의원
  ACADEMY = 'ACADEMY', // 학원·교육
  BEAUTY_HEALTH = 'BEAUTY_HEALTH', // 뷰티·헬스
  SHOPPING_MALL = 'SHOPPING_MALL', // 쇼핑몰
  SERVICE = 'SERVICE', // 서비스업
  OTHER = 'OTHER', // 기타(직접 입력)
}

/** 현재 고민 영역 (복수 선택, 최대 2개) */
export enum SubscriptionConcern {
  SALES_INCREASE = 'SALES_INCREASE', // 매출 증가
  CUSTOMER_ACQUISITION = 'CUSTOMER_ACQUISITION', // 고객 유입
  BRAND_AWARENESS = 'BRAND_AWARENESS', // 브랜드 인지도
  EFFICIENCY_AND_DIRECTION = 'EFFICIENCY_AND_DIRECTION', // 효율 분석 / 마케팅 방향성 점검
}

/** 현재 마케팅 진행 상태 (단일 선택) */
export enum SubscriptionMarketingStatus {
  NONE = 'NONE', // 현재 별도의 마케팅을 진행하고 있지 않음
  INTERNAL = 'INTERNAL', // 내부에서 간단히 진행 중
  OUTSOURCING = 'OUTSOURCING', // 외주 또는 대행사를 이용 중
  SUSPENDED = 'SUSPENDED', // 과거에 진행했으나 중단한 상태
}

/** 관심 있는 마케팅 채널 (복수 선택) */
export enum SubscriptionChannel {
  NAVER_BLOG = 'NAVER_BLOG', // 네이버 블로그(기자단 체험단)
  NAVER_CAFE = 'NAVER_CAFE', // 네이버 카페/커뮤니티
  NAVER_SMARTPLACE = 'NAVER_SMARTPLACE', // 네이버 스마트플레이스
  INSTAGRAM = 'INSTAGRAM', // 인스타그램
  YOUTUBE = 'YOUTUBE', // 유튜브
  SHORTFORM_ADS = 'SHORTFORM_ADS', // 플랫폼별 숏폼 광고
  OTHER = 'OTHER', // 기타(자유 기재)
}

/** 연락 가능 시간대 (복수 선택) */
export enum SubscriptionContactTimeSlot {
  SLOT_09_12 = '09_12', // 09:00~12:00
  SLOT_12_15 = '12_15', // 12:00~15:00
  SLOT_15_18 = '15_18', // 15:00~18:00
  SLOT_18_00 = '18_00', // 18:00~00:00
  ANY = 'ANY', // 무관
  CUSTOM = 'CUSTOM', // 특정시간대(직접 입력)
}

/** 상담 신청 생성 시 클라이언트가 보내는 payload 타입 */
export interface SubscriptionFormPayload {
  /** 담당자명 */
  name: string;
  /** 이메일 */
  email: string;
  /** 연락처 */
  phone?: string;
  /** 업체명 */
  companyName?: string;
  /** 업종 */
  industry?: SubscriptionIndustry;
  /** 업종 '기타'일 때 직접 입력 */
  industryOther?: string;
  /** 고민 영역 (최대 2개) */
  concerns?: SubscriptionConcern[];
  /** 현재 마케팅 진행 상태 */
  marketingStatus?: SubscriptionMarketingStatus;
  /** 관심 마케팅 채널 (복수) */
  interestedChannels?: SubscriptionChannel[];
  /** 관심 채널 '기타'일 때 직접 입력 */
  channelsOther?: string;
  /** 추가 공유 사항 (자유 텍스트) */
  message?: string;
  /** 지역 */
  region?: string;
  /** 연락 가능 시간대 (복수) */
  contactTimeSlots?: SubscriptionContactTimeSlot[];
  /** 연락 가능 '특정시간대'일 때 직접 입력 */
  contactTimeOther?: string;
}
