import swaggerJsdoc from 'swagger-jsdoc';
import ENV from '../common/constants/ENV';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Eternal Backend API',
      version: '1.0.0',
      description: '마케팅 홈페이지 어드민 및 칼럼 관리 API 문서',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: ENV.BaseUrl,
        description:
          ENV.NodeEnv === 'production'
            ? 'Production server'
            : 'Development server',
      },
      ...(ENV.NodeEnv !== 'production'
        ? [
            {
              url: 'http://localhost:3000',
              description: 'Local development server',
            },
          ]
        : []),
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 토큰을 입력하세요. 예: Bearer {token}',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'object',
            },
          },
        },
        Admin: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
            },
            isActive: {
              type: 'boolean',
            },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Column: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
            },
            slug: {
              type: 'string',
            },
            content: {
              type: 'string',
            },
            excerpt: {
              type: 'string',
              nullable: true,
            },
            thumbnailUrl: {
              type: 'string',
              nullable: true,
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'PUBLISHED', 'PRIVATE'],
            },
            authorId: {
              type: 'string',
              format: 'uuid',
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            viewCount: {
              type: 'integer',
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            slug: {
              type: 'string',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            parentId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            order: {
              type: 'integer',
            },
            isActive: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Media: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            originalName: {
              type: 'string',
            },
            fileName: {
              type: 'string',
            },
            mimeType: {
              type: 'string',
            },
            size: {
              type: 'integer',
            },
            url: {
              type: 'string',
            },
            uploadedBy: {
              type: 'string',
              format: 'uuid',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        PageContent: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            key: {
              type: 'string',
            },
            title: {
              type: 'string',
              nullable: true,
            },
            content: {
              type: 'string',
            },
            type: {
              type: 'string',
              enum: ['TEXT', 'HTML', 'JSON', 'IMAGE'],
            },
            isActive: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: '인증 관련 API',
      },
      {
        name: 'Columns',
        description: '칼럼(게시글) 관리 API',
      },
      {
        name: 'Categories',
        description: '카테고리 관리 API',
      },
      {
        name: 'Page Content',
        description: '홈페이지 컨텐츠 관리 API',
      },
      {
        name: 'Media',
        description: '미디어 파일 관리 API',
      },
      {
        name: 'Health',
        description: '서버 상태 확인 API',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/index.ts'], // 파일 경로
};

export const swaggerSpec = swaggerJsdoc(options);
