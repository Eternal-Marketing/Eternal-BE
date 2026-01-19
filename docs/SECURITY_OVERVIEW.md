## Backend Security Overview

이 문서는 Eternal Backend의 **현재 보안 구조**와 **적용된 방어 기법**, 그리고 **주의/개선 포인트**를 정리한 문서입니다.

---

## 1. 인증/인가

- **인증 방식**: 이메일/비밀번호 기반 어드민 로그인
  - `/api/auth/login` 에서 `admin@example.com + password`로 로그인
  - 비밀번호는 `bcrypt` 해시로 저장 (`src/utils/bcrypt.ts`)
- **토큰 방식**: JWT Access Token + Refresh Token
  - Access Token: 15분 만료
  - Refresh Token: 7일 만료
  - Payload: `adminId`, `email`, `role`
  - 구현: `src/utils/jwt.ts`
- **보호 대상 엔드포인트**
  - `authenticate` 미들웨어를 통해 보호
  - 예: `/api/columns` (POST/PUT/DELETE), `/api/categories`, `/api/tags`, `/api/page-content`, `/api/subscriptions`(어드민용)
  - 구현: `src/middleware/auth.ts`
- **역할(Role) 기반 인가**
  - `authorize(...allowedRoles)` 미들웨어 존재 (`src/middleware/auth.ts`)
  - 현재는 주로 인증 여부 위주로 사용, 역할별 세분화는 필요 시 확장 가능

---

## 2. 비밀번호 및 민감정보 처리

- **비밀번호 저장 방식**
  - `bcrypt`로 해싱 (`hashPassword`, `comparePassword`)
  - 평문 비밀번호는 DB/로그에 남기지 않도록 구현
  - 관련 코드: `src/utils/bcrypt.ts`, `src/services/authService.ts`, `src/models/Admin.ts`
- **로그에 민감정보 노출 방지**
  - 전역 에러 핸들러는 기본적으로 에러 메시지와 스택만 로깅
  - `DEBUG=true`일 때 요청 body까지 로깅하므로, 운영 환경에서는 `DEBUG=false` 유지 권장
  - 구현: `src/middleware/errorHandler.ts`, `src/utils/logger.ts`

---

## 3. JWT 시크릿 및 환경변수

- **필수 환경변수**
  - `JWT_SECRET`, `JWT_REFRESH_SECRET`
  - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
  - `PORT`, `NODE_ENV`, `UPLOAD_DIR` 등
- **현재 구현 상태**
  - `src/utils/jwt.ts` 에서 환경변수가 없을 경우 기본 문자열로 fallback
    - `your-secret-key-change-in-production`
    - `your-refresh-secret-key-change-in-production`
  - 개발 편의성은 있으나, 운영 환경에서 **환경변수 미설정 시 취약**해질 수 있음
- **권장 정책**
  - 운영 환경에서는 반드시:
    - 강력한 랜덤 시크릿을 ENV에 설정
    - 기본 문자열이 사용되지 않도록 `.env` / Coolify 환경변수 관리
  - 추후 개선 방향:
    - `JWT_SECRET` / `JWT_REFRESH_SECRET`가 없으면 **애플리케이션이 기동되지 않도록** 변경

---

## 4. 레이어드 아키텍처 및 책임 분리

- **구조**
  - `routes/` → HTTP 경로 정의
  - `controllers/` → 요청/응답 처리
  - `services/` → 비즈니스 로직
  - `repositories/` → DB 접근 (Sequelize Model wrapper)
  - `models/` → Sequelize 모델 정의
  - `middleware/` → 인증/에러/로그 등 공통 처리
- **보안 측면 장점**
  - 인증/인가 로직이 `middleware/auth.ts`에 집중되어 있어 일관성 확보
  - 에러 처리와 로깅이 `middleware/errorHandler.ts`, `utils/logger.ts`로 분리되어 있어, 민감정보 필터링/마스킹 등을 한 곳에서 개선 가능

---

## 5. CORS 및 API 접근

- **CORS 설정**
  - `src/index.ts`:
    - `origin: true` → 요청 Origin 허용 (프록시/프론트에서 조정 필요)
    - `credentials: true` → 쿠키/인증 헤더 허용
  - 장점: 다양한 프론트엔드에서 접근 가능
  - 주의: 운영 환경에서는 **허용 Origin을 명시적 리스트(화이트리스트)**로 제한하는 것이 더 안전

---

## 6. 데이터베이스 보안

- **DB 연결**
  - Sequelize + MySQL
  - 설정: `src/db/config.js`, `src/db/index.ts`
  - 연결 정보는 모두 환경변수에서 로드 (`.env` / Coolify env)
- **마이그레이션/시더 관리**
  - 마이그레이션: `src/db/migrations/`
  - 시더: `src/db/seeders/`
  - 기본 admin 계정 및 샘플 데이터는 **시더로만 생성**되므로, 운영 환경에서 시더 실행 정책 관리 필요
- **외래키 및 제약조건**
  - FK 제약으로 참조 무결성 보장 (예: `columns.category_id` → `categories.id`)
  - 삭제/갱신 시 `ON DELETE SET NULL` / `ON DELETE CASCADE` 등 명시

---

## 7. 샘플 데이터 및 기본 어드민 계정

- **현재 시더 동작**
  - 어드민 계정:
    - 이메일: `admin@example.com`
    - 비밀번호: `admin123` (bcrypt 해시로 저장)
  - 카테고리 5개 + 각 카테고리별 샘플 칼럼 1개
- **보안 관점에서의 주의사항**
  - 이 계정/비밀번호 조합은 **운영 환경에서 그대로 사용하면 안 됨**
  - 운영 배포 시에는:
    - 시더를 운영용/개발용으로 분리하거나
    - 운영 환경에서는 기본 어드민/샘플 데이터 생성 로직을 비활성화
    - 실제 운영용 어드민 계정은 강력한 비밀번호로 별도 생성

---

## 8. 로깅 및 모니터링

- **요청/응답 로깅**
  - `requestLogger` 미들웨어에서 모든 요청에 대한 메소드/URL/응답코드/소요시간 로깅
  - 구현: `src/middleware/requestLogger.ts`, `src/utils/logger.ts`
- **헬스 체크**
  - `/health` 엔드포인트에서 DB 연결 상태 포함하여 확인
  - 구현: `src/services/healthService.ts`, `src/controllers/healthController.ts`

---

## 9. 정리 및 향후 개선 포인트

이미 적용된 보안 요소:
- 비밀번호 해시(bcrypt)
- JWT 기반 인증 (Access/Refresh 토큰)
- 인증/인가 미들웨어 분리
- 전역 에러 핸들러 및 로깅 체계
- 환경변수 기반 DB/JWT 설정
- 마이그레이션/시더를 이용한 스키마/초기 데이터 관리

추가로 고려할 수 있는 개선:
- JWT 시크릿 환경변수 미설정 시 애플리케이션 기동 실패 처리
- 운영 환경에서 CORS Origin 화이트리스트 적용
- 운영/개발용 시더 분리 (기본 admin 계정/샘플 데이터 제거 또는 조건부 실행)
- DEBUG 모드에서의 로그에 민감정보(body) 마스킹 처리

