# 데이터베이스 연결 설정 가이드

## 📋 Prisma + PostgreSQL 연동 설정

현재 프로젝트는 Prisma ORM을 사용하여 PostgreSQL과 연결됩니다.

---

## 🔧 설정 방법

### 1. .env 파일 생성

프로젝트 루트에 `.env` 파일을 생성하세요:

```bash
cp .env.example .env
```

또는 직접 생성:

```bash
touch .env
```

### 2. 데이터베이스 연결 문자열 설정

`.env` 파일에 다음 내용을 추가하세요:

```env
# 데이터베이스 연결
DATABASE_URL="postgresql://사용자명:비밀번호@호스트:포트/데이터베이스명?schema=public"

# 예시들:

# 로컬 PostgreSQL (기본 설정)
DATABASE_URL="postgresql://postgres:password@localhost:5432/eternal_db?schema=public"

# 로컬 PostgreSQL (비밀번호 없음)
DATABASE_URL="postgresql://postgres@localhost:5432/eternal_db?schema=public"

# 원격 PostgreSQL (예: AWS RDS, Heroku Postgres 등)
DATABASE_URL="postgresql://user:pass@your-db-host.com:5432/dbname?schema=public"
```

---

## 🔍 연결 문자열 형식 설명

```
postgresql://[사용자명]:[비밀번호]@[호스트]:[포트]/[데이터베이스명]?schema=public
```

- **사용자명**: PostgreSQL 사용자 이름 (기본: `postgres`)
- **비밀번호**: PostgreSQL 비밀번호
- **호스트**: 데이터베이스 서버 주소 (로컬: `localhost`)
- **포트**: PostgreSQL 포트 (기본: `5432`)
- **데이터베이스명**: 사용할 데이터베이스 이름 (예: `eternal_db`)
- **schema**: 스키마 이름 (보통 `public`)

---

## 💻 로컬 PostgreSQL 설치 및 설정

### macOS (Homebrew)

```bash
# PostgreSQL 설치
brew install postgresql@15

# PostgreSQL 시작
brew services start postgresql@15

# PostgreSQL 접속
psql postgres

# 데이터베이스 생성
CREATE DATABASE eternal_db;

# 사용자 생성 (선택사항)
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE eternal_db TO your_username;

# 나가기
\q
```

### Windows

1. [PostgreSQL 다운로드](https://www.postgresql.org/download/windows/)
2. 설치 마법사 따라하기
3. 설치 중 비밀번호 설정
4. pgAdmin 또는 psql로 접속하여 데이터베이스 생성

### Linux (Ubuntu/Debian)

```bash
# PostgreSQL 설치
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQL 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PostgreSQL 접속 (postgres 사용자로)
sudo -u postgres psql

# 데이터베이스 생성
CREATE DATABASE eternal_db;

# 나가기
\q
```

---

## 🚀 데이터베이스 초기화

### 1. Prisma Client 생성

```bash
npm run prisma:generate
```

이 명령어는 Prisma 스키마를 읽어서 TypeScript 타입과 데이터베이스 클라이언트를 생성합니다.

### 2. 데이터베이스 마이그레이션 실행

```bash
npm run prisma:migrate
```

이 명령어는:
- 마이그레이션 파일을 생성합니다
- 데이터베이스에 테이블을 생성합니다
- 모든 모델(Admin, Column, Category 등)을 데이터베이스에 적용합니다

**마이그레이션 이름 입력 요청 시:**
```
? Enter a name for the new migration: init
```

### 3. 초기 데이터 시딩 (선택사항)

```bash
npm run prisma:seed
```

이 명령어는:
- 기본 어드민 계정을 생성합니다
- 샘플 카테고리 데이터를 추가합니다

**기본 어드민 계정:**
- Email: `admin@example.com`
- Password: `admin123`

---

## ✅ 연결 확인

### 방법 1: Health Check API

서버를 실행한 후:

```bash
npm run dev
```

브라우저에서 접속:
```
http://localhost:3000/health
```

응답 예시:
```json
{
  "status": "ok",
  "timestamp": "2024-12-26T...",
  "uptime": 123.45,
  "environment": "development",
  "database": "connected"  // ← "connected"면 정상!
}
```

### 방법 2: Prisma Studio

데이터베이스 GUI로 확인:

```bash
npm run prisma:studio
```

브라우저에서 `http://localhost:5555` 자동으로 열립니다.

### 방법 3: 직접 SQL 확인

```bash
psql -U postgres -d eternal_db

# 테이블 목록 확인
\dt

# 특정 테이블 구조 확인
\d "Admin"

# 나가기
\q
```

---

## 🔧 환경 변수 전체 예시

`.env` 파일 전체 예시:

```env
# 데이터베이스
DATABASE_URL="postgresql://postgres:password@localhost:5432/eternal_db?schema=public"

# 서버 설정
PORT=3000
NODE_ENV=development

# JWT 설정 (프로덕션에서는 반드시 변경!)
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production

# 파일 업로드
UPLOAD_DIR=uploads
BASE_URL=http://localhost:3000
```

---

## 🐛 문제 해결

### 1. "Can't reach database server" 에러

**원인**: PostgreSQL이 실행되지 않았거나 연결 정보가 잘못됨

**해결**:
```bash
# PostgreSQL 상태 확인
brew services list  # macOS
# 또는
sudo systemctl status postgresql  # Linux

# PostgreSQL 시작
brew services start postgresql@15  # macOS
# 또는
sudo systemctl start postgresql  # Linux
```

### 2. "database does not exist" 에러

**원인**: 데이터베이스가 생성되지 않음

**해결**:
```bash
psql postgres
CREATE DATABASE eternal_db;
\q
```

### 3. "password authentication failed" 에러

**원인**: 비밀번호가 잘못됨

**해결**: `.env` 파일의 `DATABASE_URL`에서 비밀번호 확인

### 4. "relation does not exist" 에러

**원인**: 마이그레이션이 실행되지 않음

**해결**:
```bash
npm run prisma:migrate
```

### 5. 포트가 이미 사용 중

**원인**: PostgreSQL이 다른 포트에서 실행 중이거나 다른 프로세스가 포트 사용

**해결**:
```bash
# PostgreSQL 포트 확인
psql postgres -c "SHOW port;"

# 또는 .env에서 포트 변경
DATABASE_URL="postgresql://postgres:password@localhost:5433/eternal_db?schema=public"
```

---

## 📚 참고 자료

- [Prisma 공식 문서](https://www.prisma.io/docs)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [PostgreSQL 연결 문자열 가이드](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)

---

## 🔐 보안 주의사항

1. **`.env` 파일은 절대 Git에 커밋하지 마세요**
   - 이미 `.gitignore`에 포함되어 있습니다
   
2. **프로덕션 환경에서는**:
   - 강력한 비밀번호 사용
   - SSL 연결 사용 (필요시)
   - 환경 변수는 서버의 안전한 곳에 저장

3. **JWT_SECRET 변경**:
   - 프로덕션에서는 반드시 랜덤한 강력한 문자열로 변경하세요

---

**작성일**: 2024년 12월 26일

