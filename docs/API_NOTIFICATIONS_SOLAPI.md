# Notifications API (Solapi 연동) — 프론트 연동 가이드

Solapi를 이용한 **SMS 테스트 발송 API**를 추가했습니다.  
어드민 화면에서 “알림 테스트” 버튼 등에 바로 연결할 수 있도록, URL / 요청 / 응답 / 인증 정보를 정리합니다.

---

## 1. 공통 사항

- **Base URL (로컬)**: `http://localhost:3000`
- **문서 URL**: `/api-docs` (Swagger UI)
- **태그**: `Notifications`
- **인증**: 어드민 JWT (`bearerAuth`)

---

## 2. 테스트용 SMS 발송 API

### 2-1. 개요

- **엔드포인트**
  - `POST /api/notifications/sms/test`
- **용도**
  - Solapi 연동이 정상 동작하는지 확인하기 위한 **테스트용 SMS 발송 API**
  - 어드민 페이지에서 “테스트 문자 보내기” 같은 기능에 연결하는 용도
- **주의**
  - 운영 전환 시에도 **테스트 전용**으로만 사용하고,
  - 실제 비즈니스용 알림은 별도의 도메인 이벤트/서비스에서 직접 호출하는 패턴을 추천합니다.

---

### 2-2. 인증

- **헤더**

```http
Authorization: Bearer <어드민 JWT 액세스 토큰>
Content-Type: application/json
```

토큰 형식과 발급 방식은 기존 어드민 로그인 플로우와 동일합니다.

---

### 2-3. 요청 (Request)

- **Method**: `POST`
- **URL**: `/api/notifications/sms/test`
- **Body (JSON)**:

```json
{
  "to": "01012345678",
  "from": "01098215258",
  "text": "테스트 메시지입니다."
}
```

- **필드 설명**
  - `to` (**필수**): 수신자 번호. 숫자만, 예: `"01012345678"`
  - `from` (선택): 발신 번호. Solapi 대시보드에 등록·승인된 발신번호, 예: `"01098215258"`
  - `text` (선택): 전송할 메시지 내용. 생략 시 서버에서 기본 테스트 문구를 사용.

요청 유효성:

- `to`가 없으면 **400 Bad Request**.
- 서버에 `SOLAPI_SENDER_NUMBER`가 설정된 경우, `from`은 생략 가능하며 보내더라도 같은 번호여야 합니다.
- 서버에 `SOLAPI_SENDER_NUMBER`가 없으면 `from`이 필요합니다.
- 번호 형식 검증은 1차적으로 Solapi에서 처리되며, 잘못된 경우 Solapi 응답 내용을 통해 확인할 수 있습니다.

---

### 2-4. 응답 (Response)

#### 성공 (200 OK)

```json
{
  "status": "success",
  "data": {
    // Solapi 응답 원본이 그대로 내려옵니다.
  }
}
```

- `data` 안에는 Solapi SDK에서 반환한 객체가 그대로 들어갑니다.
- 실제 운영 시에는 필요한 필드(`groupId`, `messageId` 등)만 골라서 사용하면 됩니다.

#### 잘못된 요청 (400 Bad Request)

```json
{
  "status": "error",
  "message": "to 필드가 필요합니다."
}
```

- 필수 값 누락, 발신번호 불일치 등 서버 단 검증 실패 시.

#### 인증 실패 (401 Unauthorized)

```json
{
  "status": "error",
  "message": "Authentication required"
}
```

또는 토큰 만료/유효하지 않음:

```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

어드민 JWT를 다시 발급받은 뒤 헤더에 넣어 호출해야 합니다.

---

## 3. Swagger 문서에서 확인하는 법

1. 브라우저에서 `http://localhost:3000/api-docs` 접속
2. 왼쪽 메뉴에서 **Notifications** 태그 선택
3. `POST /api/notifications/sms/test` 엔드포인트 확인
4. 상단 🔒 **Authorize** 버튼을 눌러 Bearer 토큰 입력
5. `Try it out` → Body 작성 → `Execute` 로 실제 발송 테스트 가능

Swagger 정의는 `src/routes/notifications.ts`의 JSDoc 주석으로 관리합니다.

---

## 4. 프론트엔드 연동 팁

- 이 API는 **어드민 전용**이므로, 어드민 페이지에서만 버튼을 노출하는 것이 좋습니다.
- 권장 UX:
  - 휴대폰 번호 입력 필드 (`to`)
  - 발신번호는 서버 설정에 맞춰 프리셋으로 한 개만 선택하거나 숨겨서 사용
  - “테스트 보내기” 버튼 클릭 시 API 호출 → 성공/실패 메시지 토스트로 표시
- 운영 전환 시:
  - `.env` 의 `SOLAPI_API_KEY`, `SOLAPI_API_SECRET`, 발신번호만 변경하면 되도록 되어 있으므로, 프론트 쪽 API 연동 코드는 그대로 유지 가능합니다.
