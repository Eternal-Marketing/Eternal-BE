# 빠른 참조 가이드 (Quick Reference)

바이브코딩 세션 중 빠르게 참고할 수 있는 코드 템플릿과 패턴입니다.

## 🚀 새 기능 추가 5분 가이드

### 1. Repository 템플릿
```typescript
// src/repositories/[entity]Repository.ts
import { PrismaClient, [Entity], Prisma } from '@prisma/client';

export class [Entity]Repository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string, tx?: Prisma.TransactionClient): Promise<[Entity] | null> {
    const client = tx || this.prisma;
    return await client.[entity].findUnique({ where: { id } });
  }

  async findMany(filters?: any, tx?: Prisma.TransactionClient): Promise<[Entity][]> {
    const client = tx || this.prisma;
    return await client.[entity].findMany({ where: filters });
  }

  async create(data: any, tx?: Prisma.TransactionClient): Promise<[Entity]> {
    const client = tx || this.prisma;
    return await client.[entity].create({ data });
  }

  async update(id: string, data: any, tx?: Prisma.TransactionClient): Promise<[Entity] | null> {
    const client = tx || this.prisma;
    try {
      return await client.[entity].update({ where: { id }, data });
    } catch (error) {
      if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') return null;
      throw error;
    }
  }

  async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || this.prisma;
    await client.[entity].delete({ where: { id } });
  }
}
```

### 2. Service 템플릿
```typescript
// src/services/[entity]Service.ts
import { PrismaClient } from '@prisma/client';
import { [Entity]Repository } from '../repositories/[entity]Repository';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class [Entity]Service {
  private [entity]Repository: [Entity]Repository;

  constructor() {
    this.[entity]Repository = new [Entity]Repository(prisma);
  }

  async findById(id: string) {
    return await this.[entity]Repository.findById(id);
  }

  async create(data: any) {
    // 비즈니스 로직 추가
    return await this.[entity]Repository.create(data);
  }

  async update(id: string, data: any) {
    // 권한 체크 등
    return await this.[entity]Repository.update(id, data);
  }

  async delete(id: string) {
    await this.[entity]Repository.delete(id);
  }
}
```

### 3. Controller 템플릿
```typescript
// src/controllers/[entity]Controller.ts
import { Request, Response } from 'express';
import { [Entity]Service } from '../services/[entity]Service';

export class [Entity]Controller {
  private [entity]Service: [Entity]Service;

  constructor() {
    this.[entity]Service = new [Entity]Service();
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const [entity] = await this.[entity]Service.findById(id);
      
      if (![entity]) {
        res.status(404).json({ status: 'error', message: 'Not found' });
        return;
      }

      res.status(200).json({ status: 'success', data: { [entity] } });
    } catch (error) {
      throw error;
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body;
      const [entity] = await this.[entity]Service.create(data);
      res.status(201).json({ status: 'success', data: { [entity] } });
    } catch (error) {
      throw error;
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      const [entity] = await this.[entity]Service.update(id, data);
      res.status(200).json({ status: 'success', data: { [entity] } });
    } catch (error) {
      throw error;
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.[entity]Service.delete(id);
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  };
}
```

### 4. Route 템플릿
```typescript
// src/routes/[entities].ts
import { Router } from 'express';
import { [Entity]Controller } from '../controllers/[entity]Controller';
// import { authenticate } from '../middleware/auth';
// import { validate } from '../middleware/validation';

const router = Router();
const [entity]Controller = new [Entity]Controller();

// GET /[entities]
router.get('/', [entity]Controller.getAll);

// GET /[entities]/:id
router.get('/:id', [entity]Controller.getById);

// POST /[entities]
router.post('/', [entity]Controller.create);

// PUT /[entities]/:id
router.put('/:id', [entity]Controller.update);

// DELETE /[entities]/:id
router.delete('/:id', [entity]Controller.delete);

export { router as [entity]Router };
```

### 5. index.ts에 등록
```typescript
// src/index.ts
import { [entity]Router } from './routes/[entities]';

app.use('/[entities]', [entity]Router);
```

---

## 🔧 자주 사용하는 Prisma 패턴

### 단순 조회
```typescript
// findUnique: 고유 필드로 조회
await prisma.user.findUnique({ where: { id } });
await prisma.user.findUnique({ where: { email } });

// findFirst: 첫 번째 결과
await prisma.user.findFirst({ where: { name: { contains: 'John' } } });

// findMany: 여러 결과
await prisma.user.findMany({ 
  where: { role: 'ADMIN' },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0,
});
```

### 관계 포함 (Include)
```typescript
// 관계된 데이터 포함
await prisma.post.findUnique({
  where: { id },
  include: {
    author: true,
    comments: true,
  },
});

// 관계 필터링
await prisma.post.findMany({
  where: {
    author: {
      email: { contains: '@example.com' }
    }
  },
  include: {
    author: {
      select: { id: true, name: true, email: true }
    }
  }
});
```

### 트랜잭션
```typescript
// 단순 트랜잭션
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.post.create({ 
    data: { ...postData, authorId: user.id } 
  });
  return user;
});

// 여러 작업
await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.post.create({ data: postData }),
]);
```

### 에러 코드
```typescript
try {
  await prisma.user.update({ where: { id }, data });
} catch (error) {
  if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') {
    // Record not found
  }
  if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
    // Unique constraint violation
  }
}
```

---

## 🎯 HTTP 상태 코드 가이드

- `200 OK` - 성공 (GET, PUT, PATCH)
- `201 Created` - 생성 성공 (POST)
- `204 No Content` - 성공, 응답 본문 없음 (DELETE)
- `400 Bad Request` - 잘못된 요청
- `401 Unauthorized` - 인증 필요
- `403 Forbidden` - 권한 없음
- `404 Not Found` - 리소스 없음
- `409 Conflict` - 충돌 (중복 등)
- `500 Internal Server Error` - 서버 에러

---

## 🔐 인증/인가 패턴

### 인증 미들웨어 적용
```typescript
// 특정 라우트에만
router.post('/secret', authenticate, controller.secretAction);

// 라우터 전체에
router.use(authenticate);
router.get('/profile', controller.getProfile);
```

### 사용자 정보 접근
```typescript
// Controller에서
const userId = (req as AuthRequest).user?.id;
```

---

## 📝 응답 포맷 표준

### 성공 응답
```typescript
// 단일 리소스
res.status(200).json({
  status: 'success',
  data: { user }
});

// 리스트
res.status(200).json({
  status: 'success',
  data: { users },
  pagination: {
    page: 1,
    limit: 10,
    total: 100
  }
});
```

### 에러 응답
```typescript
// 404
res.status(404).json({
  status: 'error',
  message: 'User not found'
});

// 400
res.status(400).json({
  status: 'error',
  message: 'Validation failed',
  errors: [...]
});
```

---

## 🛠️ 유용한 스니펫

### 환경 변수
```typescript
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET!;
```

### 날짜 포맷
```typescript
new Date().toISOString(); // "2024-01-01T00:00:00.000Z"
```

### UUID 생성
```typescript
// Prisma가 자동 생성 (@default(uuid()))
// 또는
import { randomUUID } from 'crypto';
const id = randomUUID();
```

### 비밀번호 해싱 (예시)
```typescript
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
```

---

## ✅ 코드 작성 체크리스트

새 기능 추가 시:
- [ ] Repository 메서드 구현
- [ ] Service 비즈니스 로직 구현
- [ ] Controller 요청/응답 처리
- [ ] Route 등록
- [ ] index.ts에 라우터 등록
- [ ] 에러 처리 확인
- [ ] 타입 안전성 확인

---

## 🔗 관련 파일 위치

- Routes: `src/routes/`
- Controllers: `src/controllers/`
- Services: `src/services/`
- Repositories: `src/repositories/`
- Middleware: `src/middleware/`
- Utils: `src/utils/`
- Types: `src/types/` (선택사항)
- Schema: `prisma/schema.prisma`

---

**팁**: 바이브코딩 중 이 문서를 옆에 두고 템플릿을 복사해서 사용하세요!


