'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🌱 Seeding additional dummy content...');

    // 1) 기본 어드민 조회 (없으면 중단)
    const adminEmail = 'admin@example.com';
    const [adminRow] = await queryInterface.sequelize.query(
      `SELECT id FROM admins WHERE email = :email`,
      {
        replacements: { email: adminEmail },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (!adminRow) {
      console.log(
        '⚠️  Admin not found. Make sure initial-data seeder has been run first.'
      );
      return;
    }

    const adminId = adminRow.id;

    // 2) 카테고리 조회 (이미 initial-data에서 생성된 5개를 대상으로 함)
    const categorySlugs = [
      'viral-marketing',
      'performance-marketing',
      'sns-marketing',
      'video-content-marketing',
      'eternal-marketing',
    ];

    const categoryRows = await queryInterface.sequelize.query(
      `SELECT id, slug FROM categories WHERE slug IN (:slugs)`,
      {
        replacements: { slugs: categorySlugs },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const categoryMap = {};
    for (const row of categoryRows) {
      categoryMap[row.slug] = row.id;
    }

    // 3) 태그 생성
    const tags = [
      { name: '마케팅', slug: 'marketing' },
      { name: '브랜딩', slug: 'branding' },
      { name: 'SNS', slug: 'sns' },
      { name: '퍼포먼스', slug: 'performance' },
      { name: '영상', slug: 'video' },
    ];

    const tagSlugs = tags.map(t => t.slug);
    const existingTags = await queryInterface.sequelize.query(
      `SELECT id, slug FROM tags WHERE slug IN (:slugs)`,
      {
        replacements: { slugs: tagSlugs },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const tagMap = {};
    for (const row of existingTags) {
      tagMap[row.slug] = row.id;
    }

    // 없으면 새로 생성
    for (const tag of tags) {
      if (!tagMap[tag.slug]) {
        const tagId = uuidv4();
        await queryInterface.bulkInsert('tags', [
          {
            id: tagId,
            name: tag.name,
            slug: tag.slug,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);
        tagMap[tag.slug] = tagId;
        console.log(`✅ Created tag: ${tag.name}`);
      }
    }

    // 4) 더미 칼럼 데이터 정의
    const articles = [
      {
        title: '바이럴 마케팅으로 병원 인지도 올리기',
        slug: 'viral-marketing-hospital-awareness',
        content: '바이럴 마케팅을 통해 병원 인지도를 효과적으로 올리는 방법을 다룹니다.',
        excerpt: '바이럴 마케팅으로 병원 인지도를 올리는 실전 전략.',
        categorySlug: 'viral-marketing',
        tags: ['marketing', 'sns'],
        status: 'PUBLISHED',
      },
      {
        title: '퍼포먼스 마케팅 예산 효율 극대화',
        slug: 'performance-marketing-budget-optimization',
        content:
          '퍼포먼스 마케팅에서 예산을 효율적으로 배분하고 성과를 극대화하는 방법을 설명합니다.',
        excerpt: '퍼포먼스 마케팅 예산 효율을 높이는 핵심 포인트.',
        categorySlug: 'performance-marketing',
        tags: ['performance', 'marketing'],
        status: 'PUBLISHED',
      },
      {
        title: 'SNS 마케팅으로 신규 환자 유입 늘리기',
        slug: 'sns-marketing-new-patient-acquisition',
        content:
          'SNS 채널을 활용해 신규 환자 유입을 늘리는 전략과 콘텐츠 기획 방법을 소개합니다.',
        excerpt: 'SNS 마케팅으로 신규 환자를 늘리는 방법.',
        categorySlug: 'sns-marketing',
        tags: ['sns', 'marketing'],
        status: 'PUBLISHED',
      },
      {
        title: '영상 콘텐츠로 병원 브랜드 스토리 전달하기',
        slug: 'video-content-marketing-brand-story',
        content:
          '영상 콘텐츠를 통해 병원의 브랜드 스토리를 효과적으로 전달하는 방법을 다룹니다.',
        excerpt: '영상 콘텐츠로 브랜딩 효과를 극대화하는 방법.',
        categorySlug: 'video-content-marketing',
        tags: ['video', 'branding'],
        status: 'PUBLISHED',
      },
      {
        title: '이터널 마케팅의 철학과 방향성',
        slug: 'eternal-marketing-philosophy',
        content:
          '이터널 마케팅이 지향하는 마케팅 철학과 장기적인 방향성에 대해 설명합니다.',
        excerpt: '이터널 마케팅이 추구하는 핵심 가치와 철학.',
        categorySlug: 'eternal-marketing',
        tags: ['marketing', 'branding'],
        status: 'PUBLISHED',
      },
    ];

    // 5) 칼럼 + column_tags 생성
    for (const article of articles) {
      const [existingColumn] = await queryInterface.sequelize.query(
        `SELECT id FROM columns WHERE slug = :slug`,
        {
          replacements: { slug: article.slug },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (existingColumn) {
        console.log(`⚠️  Column already exists: ${article.slug}`);
        continue;
      }

      const categoryId = categoryMap[article.categorySlug] || null;
      const columnId = uuidv4();

      await queryInterface.bulkInsert('columns', [
        {
          id: columnId,
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt,
          status: article.status,
          author_id: adminId,
          category_id: categoryId,
          view_count: 0,
          published_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
      console.log(`✅ Created column: ${article.title}`);

      // column_tags 생성
      for (const tagSlug of article.tags) {
        const tagId = tagMap[tagSlug];
        if (!tagId) continue;

        const [existingRelation] = await queryInterface.sequelize.query(
          `SELECT id FROM column_tags WHERE column_id = :columnId AND tag_id = :tagId`,
          {
            replacements: { columnId, tagId },
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        if (!existingRelation) {
          await queryInterface.bulkInsert('column_tags', [
            {
              id: uuidv4(),
              column_id: columnId,
              tag_id: tagId,
              created_at: new Date(),
            },
          ]);
        }
      }
    }

    console.log('✨ Additional dummy content seeding completed!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🧹 Cleaning up additional dummy content...');

    const articleSlugs = [
      'viral-marketing-hospital-awareness',
      'performance-marketing-budget-optimization',
      'sns-marketing-new-patient-acquisition',
      'video-content-marketing-brand-story',
      'eternal-marketing-philosophy',
    ];

    const tagSlugs = ['marketing', 'branding', 'sns', 'performance', 'video'];

    // 칼럼 ID 조회
    const columns = await queryInterface.sequelize.query(
      `SELECT id FROM columns WHERE slug IN (:slugs)`,
      {
        replacements: { slugs: articleSlugs },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const columnIds = columns.map(c => c.id);

    if (columnIds.length > 0) {
      // column_tags 삭제
      await queryInterface.bulkDelete('column_tags', {
        column_id: { [Sequelize.Op.in]: columnIds },
      });

      // columns 삭제
      await queryInterface.bulkDelete('columns', {
        slug: articleSlugs,
      });
    }

    // tags 삭제 (다른 곳에서 사용하지 않는다는 전제)
    await queryInterface.bulkDelete('tags', {
      slug: tagSlugs,
    });

    console.log('🧹 Additional dummy content cleanup completed!');
  },
};

