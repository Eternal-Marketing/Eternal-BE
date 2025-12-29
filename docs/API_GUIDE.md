# API 사용 가이드

## 🔐 인증 (Authentication)

### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "Administrator",
      "role": "SUPER_ADMIN"
    }
  }
}
```

### 현재 로그인된 어드민 정보
```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

---

## 📝 칼럼 (Columns)

### 칼럼 목록 조회
```http
GET /api/columns?page=1&limit=10&status=PUBLISHED&categoryId={id}&search=키워드
```

**Query Parameters:**
- `page`: 페이지 번호 (기본: 1)
- `limit`: 페이지당 항목 수 (기본: 10)
- `status`: DRAFT, PUBLISHED, PRIVATE
- `categoryId`: 카테고리 ID
- `tagId`: 태그 ID
- `search`: 검색 키워드
- `authorId`: 작성자 ID
- `orderBy`: 정렬 기준 (createdAt, publishedAt, viewCount, title)
- `orderDirection`: 정렬 방향 (asc, desc)

### 칼럼 상세 조회 (ID)
```http
GET /api/columns/:id?incrementView=true
```

### 칼럼 상세 조회 (Slug)
```http
GET /api/columns/slug/:slug?incrementView=true
```

### 칼럼 생성 (어드민만)
```http
POST /api/columns
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "칼럼 제목",
  "slug": "column-slug",
  "content": "칼럼 내용...",
  "excerpt": "칼럼 요약",
  "thumbnailUrl": "https://example.com/image.jpg",
  "status": "PUBLISHED",
  "categoryId": "category-uuid",
  "tagIds": ["tag-uuid-1", "tag-uuid-2"]
}
```

### 칼럼 수정 (어드민만)
```http
PUT /api/columns/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "status": "PUBLISHED"
}
```

### 칼럼 삭제 (어드민만)
```http
DELETE /api/columns/:id
Authorization: Bearer {accessToken}
```

### 칼럼 상태 변경 (어드민만)
```http
PATCH /api/columns/:id/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "PUBLISHED"
}
```

---

## 📂 카테고리 (Categories)

### 카테고리 목록
```http
GET /api/categories?includeInactive=true
```

### 카테고리 상세
```http
GET /api/categories/:id
```

### 카테고리 생성 (어드민만)
```http
POST /api/categories
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "카테고리명",
  "slug": "category-slug",
  "description": "설명",
  "parentId": null,
  "order": 0
}
```

### 카테고리 수정 (어드민만)
```http
PUT /api/categories/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "수정된 이름",
  "isActive": true
}
```

### 카테고리 삭제 (어드민만)
```http
DELETE /api/categories/:id
Authorization: Bearer {accessToken}
```

---

## 🏷️ 태그 (Tags)

### 태그 목록
```http
GET /api/tags?includeCount=true
```

### 태그 상세
```http
GET /api/tags/:id
```

### 태그 생성 (어드민만)
```http
POST /api/tags
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "태그명",
  "slug": "tag-slug"
}
```

### 태그 삭제 (어드민만)
```http
DELETE /api/tags/:id
Authorization: Bearer {accessToken}
```

---

## 🏠 홈페이지 컨텐츠 (Page Content)

### 컨텐츠 목록
```http
GET /api/page-content
```

### 컨텐츠 조회 (키로)
```http
GET /api/page-content/:key
```

### 컨텐츠 수정 (어드민만)
```http
PUT /api/page-content/:key
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "제목",
  "content": "내용",
  "type": "HTML",
  "isActive": true
}
```

### 컨텐츠 생성/업데이트 (어드민만)
```http
POST /api/page-content
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "key": "main_banner",
  "title": "메인 배너",
  "content": "<h1>환영합니다</h1>",
  "type": "HTML",
  "isActive": true
}
```

**ContentType:**
- `TEXT`: 일반 텍스트
- `HTML`: HTML 컨텐츠
- `JSON`: JSON 데이터
- `IMAGE`: 이미지 URL

---

## 📁 미디어 (Media)

### 파일 업로드 (어드민만)
```http
POST /api/media/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [이미지 파일]
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "media": {
      "id": "uuid",
      "originalName": "image.jpg",
      "fileName": "uuid.jpg",
      "mimeType": "image/jpeg",
      "size": 12345,
      "url": "http://localhost:3000/uploads/uuid.jpg"
    }
  }
}
```

### 미디어 목록
```http
GET /api/media?page=1&limit=20&uploadedBy={adminId}
```

### 미디어 상세
```http
GET /api/media/:id
```

### 미디어 삭제 (어드민만)
```http
DELETE /api/media/:id
Authorization: Bearer {accessToken}
```

---

## 🔒 인증 헤더

모든 보호된 엔드포인트는 다음 헤더가 필요합니다:

```http
Authorization: Bearer {accessToken}
```

---

## 📊 응답 포맷

### 성공 응답
```json
{
  "status": "success",
  "data": {
    ...
  }
}
```

### 에러 응답
```json
{
  "status": "error",
  "message": "에러 메시지"
}
```

### 페이지네이션 응답
```json
{
  "status": "success",
  "data": {
    "columns": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

## 🚀 빠른 시작 예제

### 1. 로그인
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 2. 칼럼 생성
```bash
curl -X POST http://localhost:3000/api/columns \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "첫 번째 칼럼",
    "slug": "first-column",
    "content": "칼럼 내용입니다...",
    "status": "PUBLISHED"
  }'
```

### 3. 파일 업로드
```bash
curl -X POST http://localhost:3000/api/media/upload \
  -H "Authorization: Bearer {accessToken}" \
  -F "file=@/path/to/image.jpg"
```

---

**참고**: 실제 운영 환경에서는 HTTPS를 사용하고, 토큰을 안전하게 관리하세요.

