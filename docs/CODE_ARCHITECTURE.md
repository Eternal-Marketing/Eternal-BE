# 코드 아키텍처 가이드

이 문서는 Eternal Backend 프로젝트의 코드 설계 원칙과 패턴을 설명합니다. 바이브코딩 세션 중 능동적으로 코드를 작성할 수 있도록 가이드를 제공합니다.

## 📐 아키텍처 개요

### 레이어드 아키텍처 (Layered Architecture)

프로젝트는 **계층형 아키텍처**를 따릅니다. 각 레이어는 명확한 책임을 가지며, 의존성은 단방향으로 흐릅니다.

```
┌─────────────────────────────────────────┐
│         Routes (라우팅 계층)              │
│  - HTTP 엔드포인트 정의                   │
│  - Request/Response 처리                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Controllers (컨트롤러 계층)          │
│  - HTTP 요청 검증                        │
│  - 응답 포맷팅                           │
│  - 에러 처리 (상위 레벨)                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       Services (비즈니스 로직 계층)        │
│  - 비즈니스 로직 구현                     │
│  - 트랜잭션 관리                         │
│  - 도메인 규칙 적용                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    Repositories (데이터 접근 계층)         │
│  - 데이터베이스 쿼리                      │
│  - CRUD 작업                             │
│  - 데이터 변환                           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Sequelize ORM                     │
│  - 데이터베이스 연결                      │
│  - 타입 안전한 쿼리                       │
└─────────────────────────────────────────┘
```

## 🏗️ 각 레이어의 역할과 책임

### 1. Routes (`src/routes/`)

**역할**: HTTP 엔드포인트를 정의하고 컨트롤러에 연결합니다.

**책임**:
- ✅ URL 경로 정의
- ✅ HTTP 메서드 매핑 (GET, POST, PUT, DELETE 등)
- ✅ 미들웨어 연결 (인증, 검증 등)
- ✅ 컨트롤러 메서드 연결

**작성 가이드**:
```typescript
// 예시: src/routes/users.ts
import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

// Protected routes (인증 필요)
router.use(authenticate); // 이후 모든 라우트는 인증 필요
router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.delete('/profile', userController.deleteProfile);

export { router as userRouter };
```

**주요 원칙**:
- 각 도메인별로 별도 라우터 파일 생성 (예: `users.ts`, `posts.ts`, `comments.ts`)
- RESTful API 설계 원칙 준수
- 미들웨어는 필요한 곳에만 적용

---

### 2. Controllers (`src/controllers/`)

**역할**: HTTP 요청을 받아 검증하고, 서비스 계층을 호출하며, 응답을 포맷팅합니다.

**책임**:
- ✅ 요청 파라미터 추출 (body, query, params)
- ✅ 요청 데이터 검증 (형식, 필수 필드 등)
- ✅ 서비스 메서드 호출
- ✅ 응답 생성 및 상태 코드 설정
- ✅ 에러 캐치 및 상위 레벨 에러 처리

**작성 가이드**:
```typescript
// 예시: src/controllers/userController.ts
import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // GET /users/:id
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);
      
      if (!user) {
        res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      // 에러는 errorHandler 미들웨어가 처리
      throw error;
    }
  };

  // POST /users
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData = req.body;
      const user = await this.userService.create(userData);
      
      res.status(201).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      throw error;
    }
  };

  // PUT /users/:id
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const user = await this.userService.update(id, updateData);
      
      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      throw error;
    }
  };

  // DELETE /users/:id
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userService.delete(id);
      
      res.status(204).send(); // No Content
    } catch (error) {
      throw error;
    }
  };
}
```

**주요 원칙**:
- 컨트롤러는 **얇게(Thin)** 유지 - 비즈니스 로직은 서비스에 위임
- 모든 컨트롤러 메서드는 `async` 함수로 작성
- 에러는 throw하고, 상세 처리權은 errorHandler 미들웨어에 위임
- 응답 형식은 일관성 있게 유지

---

### 3. Services (`src/services/`)

**역할**: 비즈니스 로직을 구현하고, 여러 레포지토리를 조합하여 복잡한 작업을 수행합니다.

**책임**:
- ✅ 비즈니스 규칙 구현
- ✅ 트랜잭션 관리
- ✅ 데이터 검증 (비즈니스 레벨)
- ✅ 여러 레포지토리 조합
- ✅ 외부 API 호출 (필요 시)

**작성 가이드**:
```typescript
// 예시: src/services/userService.ts
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../repositories/userRepository';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository(prisma);
  }

  async findById(id: string) {
    // 비즈니스 로직: 사용자 조회
    const user = await this.userRepository.findById(id);
    return user;
  }

  async create(userData: { email: string; name: string; password: string }) {
    // 비즈니스 로직: 이메일 중복 체크
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already exists') as AppError;
    }

    // 비즈니스 로직: 비밀번호 해싱 (예시)
    const hashedPassword = await this.hashPassword(userData.password);

    // 트랜잭션으로 사용자 생성
    return await prisma.$transaction(async (tx) => {
      const user = await this.userRepository.create({
        ...userData,
        password: hashedPassword,
      }, tx);

      // 추가 작업: 환영 이메일 발송 등
      // await this.sendWelcomeEmail(user.email);

      return user;
    });
  }

  async update(id: string, updateData: Partial<{ name: string; email: string }>) {
    // 비즈니스 로직: 권한 체크 등
    
    // 업데이트 실행
    const user = await this.userRepository.update(id, updateData);
    
    if (!user) {
      throw new Error('User not found') as AppError;
    }

    return user;
  }

  async delete(id: string) {
    // 비즈니스 로직: 소프트 삭제 또는 관련 데이터 정리
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new Error('User not found') as AppError;
    }

    // 관련 데이터 정리 예시
    // await this.userRepository.deleteUserPosts(id);

    await this.userRepository.delete(id);
  }

  private async hashPassword(password: string): Promise<string> {
    // 비밀번호 해싱 로직 (bcrypt 등 사용)
    return password; // 실제로는 해싱 구현 필요
  }
}
```

**주요 원칙**:
- 서비스는 **비즈니스 로직의 중심**
- 데이터베이스 작업은 레포지토리에 위임
- 복잡한 작업은 트랜잭션으로 처리
- 재사용 가능한 메서드로 분리

---

### 4. Repositories (`src/repositories/`)

**역할**: 데이터베이스 접근 로직을 캡슐화합니다. Prisma Client를 사용하여 실제 쿼리를 수행합니다.

**책임**:
- ✅ 데이터베이스 CRUD 작업
- ✅ 쿼리 최적화
- ✅ 데이터 변환 (DB 모델 ↔ 도메인 모델)
- ✅ 트랜잭션 지원

**작성 가이드**:
```typescript
// 예시: src/repositories/userRepository.ts
import { PrismaClient, User, Prisma } from '@prisma/client';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string, tx?: Prisma.TransactionClient): Promise<User | null> {
    const client = tx || this.prisma;
    return await client.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string, tx?: Prisma.TransactionClient): Promise<User | null> {
    const client = tx || this.prisma;
    return await client.user.findUnique({
      where: { email },
    });
  }

  async findMany(
    filters?: { email?: string; name?: string },
    options?: { skip?: number; take?: number },
    tx?: Prisma.TransactionClient
  ): Promise<User[]> {
    const client = tx || this.prisma;
    
    const where: Prisma.UserWhereInput = {};
    if (filters?.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }
    if (filters?.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }

    return await client.user.findMany({
      where,
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    data: { email: string; name: string; password: string },
    tx?: Prisma.TransactionClient
  ): Promise<User> {
    const client = tx || this.prisma;
    return await client.user.create({
      data,
    });
  }

  async update(
    id: string,
    data: Partial<{ name: string; email: string }>,
    tx?: Prisma.TransactionClient
  ): Promise<User | null> {
    const client = tx || this.prisma;
    try {
      return await client.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      // P2025: Record not found
      if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || this.prisma;
    await client.user.delete({
      where: { id },
    });
  }
}
```

**주요 원칙**:
- 레포지토리는 **데이터 접근만** 담당
- 트랜잭션을 지원하도록 `tx` 파라미터 옵셔널로 제공
- Prisma의 타입 안전성 활용
- 재사용 가능한 쿼리 메서드 제공

---

### 5. Middleware (`src/middleware/`)

**역할**: 요청/응답 사이클 중간에 실행되는 함수들입니다.

**책임**:
- ✅ 인증/인가 처리
- ✅ 요청 데이터 검증
- ✅ 에러 처리
- ✅ 로깅
- ✅ 요청 변환

**작성 가이드**:

#### 에러 핸들러 (이미 구현됨)
```typescript
// src/middleware/errorHandler.ts
// 이미 구현되어 있음
```

#### 인증 미들웨어 예시
```typescript
// 예시: src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      const error = new Error('Authentication required') as AppError;
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    const appError = error as AppError;
    appError.statusCode = 401;
    appError.status = 'error';
    next(appError);
  }
};
```

#### 검증 미들웨어 예시
```typescript
// 예시: src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from './errorHandler';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      const appError = new Error('Validation failed') as AppError;
      appError.statusCode = 400;
      appError.status = 'error';
      next(appError);
    }
  };
};
```

---

### 6. Utils (`src/utils/`)

**역할**: 공통으로 사용되는 유틸리티 함수들을 모아둡니다.

**작성 가이드**:
```typescript
// 예시: src/utils/logger.ts
export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  },
};

// 예시: src/utils/response.ts
import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, statusCode = 200) => {
  res.status(statusCode).json({
    status: 'success',
    data,
  });
};

export const sendError = (res: Response, message: string, statusCode = 500) => {
  res.status(statusCode).json({
    status: 'error',
    message,
  });
};
```

---

## 🎯 새로운 기능 추가 가이드

새로운 기능을 추가할 때 다음 순서를 따르세요:

### 1단계: Prisma Schema 수정
```prisma
// prisma/schema.prisma
model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2단계: Migration 실행
```bash
npm run prisma:migrate
npm run prisma:generate
```

### 3단계: Repository 생성
```typescript
// src/repositories/postRepository.ts
// 위의 Repository 패턴 참고
```

### 4단계: Service 생성
```typescript
// src/services/postService.ts
// 위의 Service 패턴 참고
```

### 5단계: Controller 생성
```typescript
// src/controllers/postController.ts
// 위의 Controller 패턴 참고
```

### 6단계: Route 생성 및 등록
```typescript
// src/routes/posts.ts
// 위의 Route 패턴 참고

// src/index.ts에 등록
import { postRouter } from './routes/posts';
app.use('/posts', postRouter);
```

---

## 📋 코딩 컨벤션

### 네이밍 규칙
- **파일명**: camelCase (예: `userController.ts`, `authMiddleware.ts`)
- **클래스명**: PascalCase (예: `UserController`, `AuthService`)
- **함수/변수명**: camelCase (예: `getUserById`, `userData`)
- **상수명**: UPPER_SNAKE_CASE (예: `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE`)

### 타입 정의
```typescript
// 별도 타입 파일 생성 권장
// src/types/user.types.ts
export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}
```

### 에러 처리
```typescript
// 커스텀 에러 클래스 사용
// src/utils/customErrors.ts
import { AppError } from '../middleware/errorHandler';

export class NotFoundError extends Error implements AppError {
  statusCode = 404;
  status = 'error';

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error implements AppError {
  statusCode = 400;
  status = 'error';

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

---

## 🔑 주요 설계 원칙

### 1. 단일 책임 원칙 (SRP)
- 각 클래스는 하나의 책임만 가집니다
- Controller는 HTTP 처리만, Service는 비즈니스 로직만, Repository는 데이터 접근만

### 2. 의존성 역전 원칙 (DIP)
- 상위 레이어가 하위 레이어에 의존하지만, 인터페이스를 통해 결합도를 낮춥니다
- Repository는 인터페이스로 정의 가능 (향후 확장성)

### 3. 관심사의 분리 (SoC)
- 각 레이어는 명확하게 분리되어 있습니다
- 비즈니스 로직과 데이터 접근 로직을 분리

### 4. DRY (Don't Repeat Yourself)
- 공통 로직은 유틸리티나 미들웨어로 추출
- 반복되는 패턴은 공통화

---

## 🚀 바이브코딩 세션 체크리스트

새로운 기능을 구현할 때 다음을 확인하세요:

- [ ] Sequelize Model에 필요한 모델이 정의되어 있나요?
- [ ] Migration이 실행되었나요? (`npm run db:migrate` 실행)
- [ ] Repository에 필요한 CRUD 메서드가 구현되었나요?
- [ ] Service에 비즈니스 로직이 올바르게 구현되었나요?
- [ ] Controller가 적절히 요청/응답을 처리하나요?
- [ ] Route가 올바르게 등록되었나요?
- [ ] 에러 처리가 적절한가요?
- [ ] 타입 안전성이 보장되나요?
- [ ] 테스트를 작성할 수 있나요? (선택사항)

---

## 📚 참고 자료

- **Sequelize 문서**: https://sequelize.org/docs/v6/
- **Express.js 가이드**: https://expressjs.com/en/guide/routing.html
- **TypeScript 핸드북**: https://www.typescriptlang.org/docs/handbook/intro.html
- **RESTful API 설계**: https://restfulapi.net/

---

## ❓ 자주 묻는 질문

**Q: Repository를 항상 만들어야 하나요?**
A: 복잡한 쿼리나 재사용이 필요한 경우 Repository를 만들지만, 간단한 CRUD는 Service에서 직접 Sequelize Model을 사용해도 됩니다.

**Q: 트랜잭션은 어디서 관리하나요?**
A: Service 계층에서 `sequelize.transaction()`을 사용하여 트랜잭션을 관리합니다.

**Q: 에러는 어디서 처리하나요?**
A: 컨트롤러에서 throw하고, errorHandler 미들웨어에서 일괄 처리합니다.

**Q: 인증/인가는 어떻게 하나요?**
A: Middleware에서 처리하며, 필요한 Route에만 적용합니다.

---

**마지막 업데이트**: 2024년


