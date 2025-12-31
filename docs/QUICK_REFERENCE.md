# 빠른 참조 가이드 (Quick Reference)

바이브코딩 세션 중 빠르게 참고할 수 있는 코드 템플릿과 패턴입니다.

## 🚀 새 기능 추가 5분 가이드

### 1. Repository 템플릿
```typescript
// src/repositories/[entity]Repository.ts
import [Entity]Model, { [Entity]CreationAttributes } from '../models/[Entity]';

export const [Entity]Repo = {
  /**
   * ID로 엔티티 조회
   */
  async findById(id: string) {
    const entity = await [Entity]Model.findByPk(id);
    return entity ? entity.get() : null;
  },

  /**
   * 조건으로 엔티티 목록 조회
   */
  async findMany(filters?: any) {
    const entities = await [Entity]Model.findAll({ 
      where: filters,
      order: [['createdAt', 'DESC']],
    });
    return entities.map(e => e.get());
  },

  /**
   * 엔티티 생성
   */
  async create(data: [Entity]CreationAttributes) {
    const entity = await [Entity]Model.create(data);
    return entity.get();
  },

  /**
   * 엔티티 수정
   */
  async update(id: string, data: Partial<[Entity]CreationAttributes>) {
    const [affectedRows] = await [Entity]Model.update(data, { 
      where: { id } 
    });
    if (affectedRows === 0) return null;
    return await [Entity]Repo.findById(id);
  },

  /**
   * 엔티티 삭제
   */
  async delete(id: string) {
    const affectedRows = await [Entity]Model.destroy({ where: { id } });
    return affectedRows > 0;
  },
};
```

### 2. Service 템플릿
```typescript
// src/services/[entity]Service.ts
import { [Entity]Repo } from '../repositories/[entity]Repository';
import { AppError } from '../middleware/errorHandler';

export const [Entity]Service = {
  async findById(id: string) {
    const entity = await [Entity]Repo.findById(id);
    if (!entity) {
      const error = new Error('[Entity] not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    return entity;
  },

  async create(data: any) {
    // 비즈니스 로직 추가
    return await [Entity]Repo.create(data);
  },

  async update(id: string, data: any) {
    // 권한 체크 등
    const entity = await [Entity]Repo.update(id, data);
    if (!entity) {
      const error = new Error('[Entity] not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    return entity;
  },

  async delete(id: string) {
    const deleted = await [Entity]Repo.delete(id);
    if (!deleted) {
      const error = new Error('[Entity] not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
  },
};
```

### 3. Controller 템플릿
```typescript
// src/controllers/[entity]Controller.ts
import { Request, Response } from 'express';
import { [Entity]Service } from '../services/[entity]Service';

export const [Entity]Controller = {
  getById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const entity = await [Entity]Service.findById(id);
    res.status(200).json({ status: 'success', data: { [entity] } });
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const data = req.body;
    const entity = await [Entity]Service.create(data);
    res.status(201).json({ status: 'success', data: { [entity] } });
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = req.body;
    const entity = await [Entity]Service.update(id, data);
    res.status(200).json({ status: 'success', data: { [entity] } });
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await [Entity]Service.delete(id);
    res.status(204).send();
  },
};
```

### 4. Route 템플릿
```typescript
// src/routes/[entities].ts
import { Router } from 'express';
import { [Entity]Controller } from '../controllers/[entity]Controller';
// import { authenticate } from '../middleware/auth';
// import { validate } from '../middleware/validation';

const router = Router();

// GET /[entities]
router.get('/', [Entity]Controller.getAll);

// GET /[entities]/:id
router.get('/:id', [Entity]Controller.getById);

// POST /[entities]
router.post('/', [Entity]Controller.create);

// PUT /[entities]/:id
router.put('/:id', [Entity]Controller.update);

// DELETE /[entities]/:id
router.delete('/:id', [Entity]Controller.delete);

export { router as [entity]Router };
```

### 5. index.ts에 등록
```typescript
// src/index.ts
import { [entity]Router } from './routes/[entities]';

app.use('/[entities]', [entity]Router);
```

---

## 🔧 자주 사용하는 Sequelize 패턴

### 단순 조회
```typescript
import UserModel from '../models/User';

// findByPk: Primary Key로 조회
await UserModel.findByPk(id);

// findOne: 첫 번째 결과
await UserModel.findOne({ where: { email } });
await UserModel.findOne({ where: { name: { [Op.like]: '%John%' } } });

// findAll: 여러 결과
await UserModel.findAll({ 
  where: { role: 'ADMIN' },
  order: [['createdAt', 'DESC']],
  limit: 10,
  offset: 0,
});
```

### 관계 포함 (Include)
```typescript
import PostModel from '../models/Post';

// 관계된 데이터 포함
await PostModel.findByPk(id, {
  include: [
    { model: UserModel, as: 'author' },
    { model: CommentModel, as: 'comments' },
  ],
});

// 관계 필터링
await PostModel.findAll({
  where: {
    '$author.email$': { [Op.like]: '%@example.com%' }
  },
  include: [{
    model: UserModel,
    as: 'author',
    attributes: ['id', 'name', 'email'],
  }],
});
```

### 트랜잭션
```typescript
import { sequelize } from '../db';

// Sequelize 트랜잭션
await sequelize.transaction(async (tx) => {
  const user = await UserModel.create(userData, { transaction: tx });
  await PostModel.create(
    { ...postData, authorId: user.id },
    { transaction: tx }
  );
  return user;
});
```

### 에러 처리
```typescript
try {
  await UserModel.update(data, { where: { id } });
} catch (error) {
  // SequelizeValidationError
  if (error instanceof ValidationError) {
    // 검증 에러 처리
  }
  // SequelizeUniqueConstraintError
  if (error instanceof UniqueConstraintError) {
    // 중복 제약 위반
  }
  throw error;
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
import { randomUUID } from 'crypto';
const id = randomUUID();

// Sequelize 모델에서 UUID 필드 사용
// migration에서 UUIDV4() 사용
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
- Models: `src/models/`
- Migrations: `src/db/migrations/`
- Seeders: `src/db/seeders/`

---

**팁**: 바이브코딩 중 이 문서를 옆에 두고 템플릿을 복사해서 사용하세요!


