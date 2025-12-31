# 어드민 기능 및 칼럼 시스템 설계 문서

## 📋 구현 기능 목록

### ✅ 필수 구현 기능

#### 1. 인증/인가 시스템
- 어드민 로그인 (JWT 기반)
- 세션/토큰 관리
- 권한 관리 (향후 확장 가능)

#### 2. 칼럼(게시글) 관리
- 칼럼 CRUD (생성, 조회, 수정, 삭제)
- 게시글 상태 관리 (초안/DRAFT, 발행/PUBLISHED, 비공개/PRIVATE)
- 검색 기능 (제목, 내용)
- 페이지네이션
- 정렬 (최신순, 조회수순 등)
- 조회수 추적

#### 3. 카테고리 관리
- 카테고리 CRUD
- 카테고리별 칼럼 필터링
- 계층형 카테고리 (선택사항)

#### 4. 태그 관리
- 태그 CRUD
- 칼럼에 태그 다중 선택
- 태그별 칼럼 조회

#### 5. 홈페이지 컨텐츠 관리
- 메인 페이지 컨텐츠 관리
- 섹션별 컨텐츠 관리 (헤더, 푸터, 메인 배너 등)
- SEO 메타데이터 관리

#### 6. 파일 업로드
- 이미지 업로드 (칼럼 썸네일, 본문 이미지)
- 파일 관리 (업로드, 삭제)

---

## 🎯 추가 기능 제안

### 1. 통계 및 분석
- **칼럼 조회수 통계**: 인기 칼럼 파악
- **일별/월별 게시글 통계**: 활동 추이 확인
- **태그 사용 통계**: 인기 태그 파악
- **검색 키워드 통계**: 사용자 관심사 파악

### 2. 고객 문의 관리
- **문의 게시판**: 고객 문의 접수 및 답변 관리
- **카카오톡 문의 로그**: 연락처별 문의 이력 관리

### 3. 컨텐츠 자동화
- **예약 발행**: 특정 날짜/시간에 자동 발행
- **자동 카테고리 분류**: AI 기반 카테고리 추천 (향후)
- **이미지 최적화**: 자동 압축 및 최적화

### 4. SEO 최적화
- **메타 태그 관리**: 각 칼럼별 SEO 설정
- **OG 이미지 설정**: SNS 공유 최적화
- **사이트맵 자동 생성**: 검색 엔진 최적화
- **URL 슬러그 관리**: 친화적인 URL 생성

### 5. 멀티미디어 관리
- **갤러리 기능**: 이미지 갤러리 관리
- **비디오 업로드**: YouTube 임베드 또는 직접 업로드
- **파일 라이브러리**: 업로드된 파일 전체 관리

### 6. 사용자 경험 개선
- **댓글 시스템**: 칼럼별 댓글 관리 (선택)
- **좋아요/북마크**: 사용자 반응 추적
- **이메일 알림**: 새 칼럼 발행 시 구독자에게 알림
- **RSS 피드**: 칼럼 업데이트 RSS 제공

### 7. 백업 및 복구
- **자동 백업**: 정기적인 데이터베이스 백업
- **버전 관리**: 칼럼 수정 이력 관리
- **롤백 기능**: 이전 버전으로 복구

### 8. 보안 강화
- **2단계 인증**: 어드민 계정 보안 강화
- **IP 제한**: 특정 IP에서만 어드민 접근
- **활동 로그**: 어드민 활동 이력 기록
- **비밀번호 정책**: 강력한 비밀번호 요구사항

### 9. 다국어 지원 (향후)
- **언어별 칼럼 관리**: 한국어/영어 등
- **자동 번역**: AI 기반 번역 지원

### 10. 통합 기능
- **소셜 미디어 연동**: 발행 시 자동 포스팅 (카카오톡, 네이버 블로그 등)
- **구글 애널리틱스 연동**: 통계 데이터 연동
- **이메일 마케팅 연동**: MailChimp, SendGrid 등

---

## 📊 데이터베이스 스키마

### Admin (어드민 계정)
- id: UUID
- email: String (unique)
- password: String (hashed)
- name: String
- role: Enum (SUPER_ADMIN, ADMIN, EDITOR)
- isActive: Boolean
- lastLoginAt: DateTime
- createdAt, updatedAt

### Column (칼럼/게시글)
- id: UUID
- title: String
- slug: String (unique, URL-friendly)
- content: String (본문)
- excerpt: String (요약)
- thumbnailUrl: String (썸네일)
- status: Enum (DRAFT, PUBLISHED, PRIVATE)
- authorId: UUID (Admin FK)
- categoryId: UUID (Category FK)
- viewCount: Int (조회수)
- publishedAt: DateTime (발행일)
- createdAt, updatedAt
- Tags (Many-to-Many)

### Category (카테고리)
- id: UUID
- name: String (unique)
- slug: String (unique)
- description: String
- parentId: UUID? (계층형 카테고리용)
- order: Int (정렬 순서)
- isActive: Boolean
- createdAt, updatedAt

### Tag (태그)
- id: UUID
- name: String (unique)
- slug: String (unique)
- createdAt, updatedAt

### PageContent (홈페이지 컨텐츠)
- id: UUID
- key: String (unique, 예: 'header_title', 'main_banner')
- title: String
- content: String (JSON 또는 텍스트)
- type: Enum (TEXT, HTML, JSON, IMAGE)
- isActive: Boolean
- createdAt, updatedAt

### Media (미디어 파일)
- id: UUID
- originalName: String
- fileName: String (저장된 파일명)
- mimeType: String
- size: Int (바이트)
- url: String (파일 경로)
- uploadedBy: UUID (Admin FK)
- createdAt, updatedAt

---

## 🔐 API 엔드포인트 설계

### 인증 (Auth)
- `POST /api/auth/login` - 어드민 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신
- `GET /api/auth/me` - 현재 로그인된 어드민 정보

### 칼럼 (Columns)
- `GET /api/columns` - 칼럼 목록 (페이지네이션, 필터링)
- `GET /api/columns/:id` - 칼럼 상세
- `POST /api/columns` - 칼럼 생성 (어드민만)
- `PUT /api/columns/:id` - 칼럼 수정 (어드민만)
- `DELETE /api/columns/:id` - 칼럼 삭제 (어드민만)
- `PATCH /api/columns/:id/status` - 상태 변경 (어드민만)

### 카테고리 (Categories)
- `GET /api/categories` - 카테고리 목록
- `GET /api/categories/:id` - 카테고리 상세
- `POST /api/categories` - 카테고리 생성 (어드민만)
- `PUT /api/categories/:id` - 카테고리 수정 (어드민만)
- `DELETE /api/categories/:id` - 카테고리 삭제 (어드민만)

### 태그 (Tags)
- `GET /api/tags` - 태그 목록
- `POST /api/tags` - 태그 생성 (어드민만)
- `DELETE /api/tags/:id` - 태그 삭제 (어드민만)

### 홈페이지 컨텐츠 (PageContent)
- `GET /api/page-content` - 전체 컨텐츠 목록
- `GET /api/page-content/:key` - 특정 키의 컨텐츠
- `PUT /api/page-content/:key` - 컨텐츠 수정 (어드민만)

### 미디어 (Media)
- `POST /api/media/upload` - 파일 업로드 (어드민만)
- `GET /api/media` - 업로드된 파일 목록
- `DELETE /api/media/:id` - 파일 삭제 (어드민만)

### 공개 API (Public)
- `GET /api/public/columns` - 발행된 칼럼만 조회 (인증 불필요)
- `GET /api/public/columns/:slug` - 슬러그로 칼럼 조회
- `GET /api/public/categories` - 활성 카테고리 목록

---

## 🎨 사용자 플로우

### 칼럼 작성 플로우
1. 어드민 로그인
2. "칼럼 작성" 클릭
3. 제목, 내용, 썸네일 이미지 업로드
4. 카테고리 선택
5. 태그 선택/생성
6. 상태 선택 (초안/발행)
7. 저장 → 발행

### 홈페이지 컨텐츠 수정 플로우
1. 어드민 로그인
2. "홈페이지 설정" 메뉴
3. 수정할 섹션 선택 (예: 메인 배너)
4. 컨텐츠 수정
5. 저장 → 즉시 반영

---

## 🔒 보안 고려사항

1. **비밀번호**: bcrypt로 해싱 (salt rounds: 10)
2. **JWT**: Access Token (15분) + Refresh Token (7일)
3. **CSRF**: 토큰 기반 CSRF 방어
4. **파일 업로드**: 파일 타입 검증, 크기 제한, 바이러스 스캔 (선택)
5. **Rate Limiting**: API 호출 제한
6. **SQL Injection**: Sequelize ORM 사용으로 방어
7. **XSS**: 입력 데이터 sanitization

---

## 📦 필요한 패키지

- `jsonwebtoken` - JWT 토큰 생성/검증
- `bcrypt` - 비밀번호 해싱
- `multer` - 파일 업로드 처리
- `zod` - 입력 데이터 검증 (선택)
- `express-rate-limit` - API 호출 제한 (선택)

---

## 🚀 구현 우선순위

### Phase 1 (핵심 기능)
1. ✅ 인증 시스템
2. ✅ 칼럼 CRUD
3. ✅ 카테고리 관리
4. ✅ 태그 관리

### Phase 2 (필수 기능)
5. ✅ 홈페이지 컨텐츠 관리
6. ✅ 파일 업로드
7. ✅ 공개 API

### Phase 3 (고도화)
8. 통계 및 분석
9. 검색 기능 강화
10. SEO 최적화

### Phase 4 (확장 기능)
11. 고객 문의 관리
12. 댓글 시스템
13. 소셜 미디어 연동

---

**마지막 업데이트**: 2024년

