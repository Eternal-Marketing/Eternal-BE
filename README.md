# Eternal Backend API

Express + TypeScript + Prisma 기반 Node.js 백엔드 애플리케이션

## 🚀 Tech Stack

- **Runtime**: Node.js (LTS >=18)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Code Quality**: ESLint + Prettier

## 📁 Project Structure

```
BE/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access layer
│   ├── routes/          # Route definitions
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── prisma/
│   └── schema.prisma    # Prisma schema
├── dist/                # Compiled JavaScript (generated)
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript configuration
├── .eslintrc.json       # ESLint configuration
├── .prettierrc.json     # Prettier configuration
└── package.json
```

## 🛠️ Setup

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL (running locally or remote)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ChoiTheCreator/Eternal-BE.git
   cd Eternal-BE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `PORT`: Server port (default: 3000)
   - `NODE_ENV`: Environment (development/production)

4. **Setup Prisma**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run migrations (creates database tables)
   npm run prisma:migrate
   
   # Seed database with initial data (optional)
   npm run prisma:seed
   ```
   
   기본 어드민 계정:
   - Email: `admin@example.com`
   - Password: `admin123`

5. **Start development server**
   ```bash
   npm run dev
   ```

   Server will start at `http://localhost:3000`
   - API Documentation: `http://localhost:3000/api-docs`

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server with hot-reload (tsx watch)
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server (requires build first)
- `npm run type-check` - Type check without emitting files

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Database (Prisma)
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply migrations (dev)
- `npm run prisma:migrate:deploy` - Apply migrations (production)
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## 📚 API Documentation

**Swagger UI**: 서버 실행 후 `http://localhost:3000/api-docs` 에서 API 문서를 확인할 수 있습니다.

모든 API 엔드포인트는 Swagger를 통해 자동 문서화되어 있으며, 직접 테스트할 수 있습니다.

## 🌐 API Endpoints

### Health Check
- `GET /health` - Check server and database health status

### Authentication (인증)
- `POST /api/auth/login` - 어드민 로그인
- `GET /api/auth/me` - 현재 로그인된 어드민 정보

### Columns (칼럼/게시글)
- `GET /api/columns` - 칼럼 목록 조회
- `GET /api/columns/:id` - 칼럼 상세 조회
- `POST /api/columns` - 칼럼 생성 (어드민)
- `PUT /api/columns/:id` - 칼럼 수정 (어드민)
- `DELETE /api/columns/:id` - 칼럼 삭제 (어드민)

### Categories (카테고리)
- `GET /api/categories` - 카테고리 목록
- `POST /api/categories` - 카테고리 생성 (어드민)

### Tags (태그)
- `GET /api/tags` - 태그 목록
- `POST /api/tags` - 태그 생성 (어드민)

### Page Content (홈페이지 컨텐츠)
- `GET /api/page-content` - 컨텐츠 목록
- `GET /api/page-content/:key` - 컨텐츠 조회
- `PUT /api/page-content/:key` - 컨텐츠 수정 (어드민)

### Media (미디어)
- `POST /api/media/upload` - 파일 업로드 (어드민)
- `GET /api/media` - 미디어 목록

**상세한 API 문서**: [API_GUIDE.md](./docs/API_GUIDE.md)

## 🏗️ Architecture

This project follows a layered architecture:

1. **Routes** (`src/routes/`) - Define API endpoints
2. **Controllers** (`src/controllers/`) - Handle HTTP requests/responses
3. **Services** (`src/services/`) - Business logic
4. **Repositories** (`src/repositories/`) - Database operations (optional layer)
5. **Middleware** (`src/middleware/`) - Express middleware (auth, error handling, etc.)

## 🔧 Configuration

### TypeScript
Configuration in `tsconfig.json` - strict mode enabled, path aliases configured (`@/*`)

### Prisma
Database schema defined in `prisma/schema.prisma`. Modify and run migrations to update.

### Environment Variables
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/eternal_db?schema=public"
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
UPLOAD_DIR=uploads
BASE_URL=http://localhost:3000
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT 토큰 비밀키 (프로덕션에서는 반드시 변경!)
- `JWT_REFRESH_SECRET` - JWT 리프레시 토큰 비밀키

Optional variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `UPLOAD_DIR` - 파일 업로드 디렉토리 (default: uploads)
- `BASE_URL` - 기본 URL (default: http://localhost:3000)

## 📝 Development Workflow

1. Make changes to TypeScript files in `src/`
2. Development server auto-reloads on file changes
3. Use `npm run lint` and `npm run format` before committing
4. Create Prisma migrations when schema changes: `npm run prisma:migrate`

## 🔒 Cross-Platform Compatibility

All scripts are cross-platform compatible (Windows/macOS/Linux):
- Uses `tsx` for TypeScript execution (no compilation step needed for dev)
- Path separators handled correctly
- No OS-specific commands in scripts

## 📦 Production Build

```bash
# Build TypeScript
npm run build

# Apply database migrations
npm run prisma:migrate:deploy
npm run prisma:generate

# Start production server
npm start
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists (Prisma will create schema automatically via migrations)

### Port Already in Use
- Change `PORT` in `.env` or kill the process using the port

### Prisma Client Not Generated
- Run `npm run prisma:generate` after schema changes

## 📄 License

ISC

## 📚 문서

### 📅 개발 일지 (기획자용)
- **[DEV_LOG.md](./docs/DEV_LOG.md)** - 백엔드 작업 내용을 기획자 관점에서 쉽게 이해할 수 있도록 기록한 개발 일지 (날짜별, 단계별 설명)

### 코드 아키텍처 가이드
- **[CODE_ARCHITECTURE.md](./docs/CODE_ARCHITECTURE.md)** - 프로젝트의 코드 설계 원칙, 레이어 구조, 각 컴포넌트의 역할과 책임에 대한 상세 가이드

### 빠른 참조 가이드
- **[QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md)** - 바이브코딩 세션 중 빠르게 참고할 수 있는 코드 템플릿과 패턴 모음

## 👥 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run format`
4. Test your changes
5. Submit a pull request

