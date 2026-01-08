# 디버깅 빠른 시작 가이드

## 🚀 1분 안에 디버깅 시작하기

### 1단계: 환경변수 설정

`.env` 파일에 추가:

```env
DEBUG=true
NODE_ENV=development
```

### 2단계: 서버 재시작

```bash
npm run dev
```

### 3단계: 로그 확인

이제 다음 정보가 자동으로 로깅됩니다:

- ✅ 모든 API 요청/응답
- ✅ SQL 쿼리
- ✅ 에러 상세 정보
- ✅ 응답 시간

---

## 📊 로그 예시

### API 요청 로그
```
🟢 POST /api/auth/login - 200 (150ms)
🟡 GET /api/users/123 - 404 (25ms)
🔴 POST /api/subscriptions - 500 (300ms)
```

### SQL 쿼리 로그 (DEBUG=true일 때)
```
[DB Query] (25ms) SELECT `id`, `name` FROM `users` WHERE `id` = '123';
```

### 에러 로그
```
[POST /api/subscriptions] Error 500: User not found
Error: User not found
    at SubscriptionService.createSubscription...
```

---

## 🔍 주요 디버깅 명령어

```bash
# 디버그 모드로 실행
DEBUG=true npm run dev

# 타입 체크
npm run type-check

# 린트 체크
npm run lint

# 포맷팅
npm run format
```

---

## 📚 더 자세한 정보

전체 가이드: [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)

