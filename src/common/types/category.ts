/** 칼럼 작성 시 선택 가능한 고정 카테고리 5개 (시더와 1:1) */
export enum CategoryCode {
  VIRAL_MARKETING = 'VIRAL_MARKETING', // 바이럴 마케팅
  PERFORMANCE_MARKETING = 'PERFORMANCE_MARKETING', // 퍼포먼스 마케팅
  SNS_MARKETING = 'SNS_MARKETING', // SNS 마케팅
  VIDEO_CONTENT_MARKETING = 'VIDEO_CONTENT_MARKETING', // 영상 콘텐츠 마케팅
  ETERNAL_MARKETING = 'ETERNAL_MARKETING', // 이터널 마케팅
}

/** 이넘 → 시더 slug 매핑 (categoryId 조회용) */
export const CATEGORY_CODE_TO_SLUG: Record<CategoryCode, string> = {
  [CategoryCode.VIRAL_MARKETING]: 'viral-marketing',
  [CategoryCode.PERFORMANCE_MARKETING]: 'performance-marketing',
  [CategoryCode.SNS_MARKETING]: 'sns-marketing',
  [CategoryCode.VIDEO_CONTENT_MARKETING]: 'video-content-marketing',
  [CategoryCode.ETERNAL_MARKETING]: 'eternal-marketing',
};
