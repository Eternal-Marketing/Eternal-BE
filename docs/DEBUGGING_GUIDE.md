# 디버깅 가이드 (Debugging Guide)

이 문서는 Eternal Backend API 프로젝트의 디버깅 방법을 안내합니다.

## 📋 목차

1. [환경변수 설정](#환경변수-설정)
2. [로깅 시스템](#로깅-시스템)
3. [디버그 모드 활성화](#디버그-모드-활성화)
4. [에러 추적](#에러-추적)
5. [데이터베이스 쿼리 디버깅](#데이터베이스-쿼리-디버깅)
6. [API 요청 디버깅](#api-요청-디버깅)
7. [일반적인 디버깅 시나리오](#일반적인-디버깅-시나리오)

---

## 환경변수 설정

`.env` 파일에 다음 환경변수를 추가하세요:

```env
# 개발 환경 설정
NODE_ENV=development

# 디버그 모드 활성화 (상세한 로그 출력)
DEBUG=true

# 데이터베이스 설정
DB_NAME=eternal_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306

# 기타 설정
PORT=3000
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### 주요 환경변수 설명

- `NODE_ENV=development`: 개발 모드 활성화 (에러 스택 트레이스 표시)
- `DEBUG=true`: 상세한 디버그 로그 활성화 (SQL 쿼리, 요청 상세 정보 등)

---

## 로깅 시스템

프로젝트는 `jet-logger`를 기반으로 한 커스텀 로거를 사용합니다.

### 로거 사용법

```typescript
import Logger from '../utils/logger';

// 정보 로그 (개발 환경에서만 출력)
Logger.info('사용자 로그인 성공', { userId: '123' });

// 경고 로그 (항상 출력)
Logger.warn('리소스 부족 경고', { memory: '80%' });

// 에러 로그 (항상 출력)
Logger.error('데이터베이스 연결 실패', error, true); // true = 전체 스택 트레이스

// 디버그 로그 (DEBUG=true일 때만 출력)
Logger.debug('쿼리 실행', { sql: 'SELECT * FROM users' });

// API 요청 로그
Logger.request('POST', '/api/auth/login', 200, 150); // method, path, status, duration(ms)

// 데이터베이스 쿼리 로그
Logger.query('SELECT * FROM users WHERE id = ?', 25); // sql, duration(ms)
```

### 로그 레벨

1. **INFO**: 일반 정보 (개발 환경에서만)
2. **WARN**: 경고 (항상 출력)
3. **ERROR**: 에러 (항상 출력)
4. **DEBUG**: 디버그 정보 (`DEBUG=true`일 때만)

---

## 디버그 모드 활성화

### 1. 환경변수로 활성화

```bash
# .env 파일에 추가
DEBUG=true
```

또는 실행 시:

```bash
DEBUG=true npm run dev
```

### 2. 디버그 모드에서 제공되는 정보

- ✅ 모든 SQL 쿼리 로그
- ✅ 요청 상세 정보 (헤더, 바디, 쿼리 파라미터)
- ✅ 에러 발생 시 요청 컨텍스트
- ✅ 응답 시간 측정
- ✅ 상세한 디버그 로그

---

## 에러 추적

### 에러 핸들러

모든 에러는 `errorHandler` 미들웨어에서 처리됩니다.

#### 개발 환경 응답 예시

```json
{
  "status": "error",
  "message": "User not found",
  "stack": "Error: User not found\n    at UserService.findById...",
  "path": "/api/users/123",
  "method": "GET"
}
```

#### 프로덕션 환경 응답 예시

```json
{
  "status": "error",
  "message": "User not found"
}
```

### 에러 로깅 위치

에러는 다음 위치에서 자동으로 로깅됩니다:

1. **서버 콘솔**: 에러 메시지와 스택 트레이스
2. **디버그 모드**: 요청 상세 정보 포함

---

## 데이터베이스 쿼리 디버깅

### SQL 쿼리 로깅 활성화

`DEBUG=true`로 설정하면 모든 SQL 쿼리가 로그에 출력됩니다.

```bash
# .env
DEBUG=true
```

### 쿼리 로그 예시

```
[DB Query] (25ms) SELECT `id`, `name`, `email` FROM `users` WHERE `id` = '123';
[DB Query] (150ms) INSERT INTO `subscriptions` (`id`, `name`, `email`, ...) VALUES (...);
```

### 수동 쿼리 로깅

```typescript
import Logger from '../utils/logger';

// 쿼리 실행 전
Logger.debug('사용자 조회 시작', { userId: '123' });

// 쿼리 실행
const user = await UserModel.findByPk('123');

// 쿼리 실행 후
Logger.debug('사용자 조회 완료', { user });
```

---

## API 요청 디버깅

### 자동 요청 로깅

모든 API 요청은 자동으로 로깅됩니다:

```
🟢 POST /api/auth/login - 200 (150ms)
🟡 GET /api/users/123 - 404 (25ms)
🔴 POST /api/subscriptions - 500 (300ms)
```

- 🟢: 성공 (2xx)
- 🟡: 클라이언트 에러 (4xx)
- 🔴: 서버 에러 (5xx)

### 디버그 모드에서 추가 정보

`DEBUG=true`일 때 요청 상세 정보가 로그에 출력됩니다:

```json
{
  "method": "POST",
  "path": "/api/auth/login",
  "query": {},
  "body": {
    "email": "admin@example.com",
    "password": "***"
  },
  "headers": {
    "user-agent": "Mozilla/5.0...",
    "content-type": "application/json"
  },
  "statusCode": 200,
  "duration": "150ms"
}
```

---

## 일반적인 디버깅 시나리오

### 1. API 응답이 느린 경우

```bash
# 1. 디버그 모드 활성화
DEBUG=true npm run dev

# 2. 요청을 보내고 로그 확인
# 응답 시간이 로그에 표시됩니다: (150ms)
```

### 2. 데이터베이스 쿼리 문제

```bash
# 1. SQL 쿼리 로깅 활성화
DEBUG=true npm run dev

# 2. 문제가 있는 API 호출
# 3. 콘솔에서 SQL 쿼리 확인
```

### 3. 인증 문제

```typescript
// authService.ts에 디버그 로그 추가
import Logger from '../utils/logger';

async login(email: string, password: string) {
  Logger.debug('로그인 시도', { email });
  
  const admin = await AdminRepo.findByEmail(email);
  Logger.debug('사용자 조회 결과', { found: !!admin });
  
  // ...
}
```

### 4. 데이터 검증 문제

```typescript
// Controller에서 요청 데이터 로깅
import Logger from '../utils/logger';

export async function createSubscription(req: Request, res: Response) {
  Logger.debug('상담신청 요청 데이터', {
    body: req.body,
    headers: req.headers,
  });
  
  // ...
}
```

### 5. 환경변수 확인

```typescript
// 서비스 시작 시 환경변수 로깅 (개발 환경에서만)
import Logger from '../utils/logger';
import ENV from '../common/constants/ENV';

if (ENV.NodeEnv === 'development') {
  Logger.info('환경 설정', {
    nodeEnv: ENV.NodeEnv,
    debug: ENV.Debug,
    dbHost: ENV.DbHost,
    dbName: ENV.DbName,
  });
}
```

---

## 디버깅 팁

### 1. 단계별 로깅

복잡한 로직은 단계별로 로깅하세요:

```typescript
Logger.debug('Step 1: 데이터 검증 시작');
// 검증 로직
Logger.debug('Step 1 완료', { isValid });

Logger.debug('Step 2: 데이터베이스 저장 시작');
// 저장 로직
Logger.debug('Step 2 완료', { savedId });
```

### 2. 성능 측정

```typescript
const startTime = Date.now();

// 작업 수행
await someAsyncOperation();

const duration = Date.now() - startTime;
Logger.debug(`작업 완료 (${duration}ms)`);
```

### 3. 조건부 로깅

```typescript
if (process.env.DEBUG === 'true') {
  Logger.debug('상세 정보', { largeDataObject });
}
```

### 4. 에러 컨텍스트 보존

```typescript
try {
  await someOperation();
} catch (error) {
  Logger.error('작업 실패', error, true);
  // 에러를 다시 throw하여 상위에서 처리
  throw error;
}
```

---

## 로그 파일 관리

현재는 콘솔에만 로그가 출력됩니다. 프로덕션 환경에서는 로그 파일로 저장하는 것을 권장합니다.

### 로그 파일 저장 예시 (향후 구현)

```typescript
// utils/logger.ts에 파일 로깅 추가
import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
```

---

## 문제 해결 체크리스트

디버깅 시 다음을 확인하세요:

- [ ] `DEBUG=true` 환경변수가 설정되어 있는가?
- [ ] `NODE_ENV=development`로 설정되어 있는가?
- [ ] 데이터베이스 연결이 정상인가? (`/health` 엔드포인트 확인)
- [ ] 필요한 환경변수가 모두 설정되어 있는가?
- [ ] 에러 로그에 스택 트레이스가 포함되어 있는가?
- [ ] SQL 쿼리가 올바르게 실행되고 있는가?
- [ ] 요청/응답 데이터가 예상과 일치하는가?

---

## 추가 리소스

- [Sequelize 문서](https://sequelize.org/docs/v6/)
- [Express 에러 핸들링](https://expressjs.com/en/guide/error-handling.html)
- [Node.js 디버깅](https://nodejs.org/en/docs/guides/debugging-getting-started/)

