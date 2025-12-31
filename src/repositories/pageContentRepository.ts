import PageContentModel, {
  PageContentCreationAttributes,
  ContentType,
} from '../models/PageContent';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PageContent = PageContentModel as any;

export const PageContentRepo = {
  /**
   * 페이지 컨텐츠 목록 조회
   */
  async findMany() {
    const contents = await PageContent.findAll({
      where: { isActive: true },
      order: [['key', 'ASC']],
    });
    return contents.map(content => content.get());
  },

  /**
   * Key로 페이지 컨텐츠 조회
   */
  async findByKey(key: string) {
    const content = await PageContent.findOne({
      where: { key },
    });
    return content ? content.get() : null;
  },

  /**
   * 페이지 컨텐츠 생성
   */
  async create(data: PageContentCreationAttributes) {
    const content = await PageContent.create(data);
    return content.get();
  },

  /**
   * 페이지 컨텐츠 수정
   */
  async update(
    key: string,
    data: {
      title?: string;
      content?: string;
      type?: ContentType;
      isActive?: boolean;
    }
  ) {
    const [updated] = await PageContent.update(data, {
      where: { key },
      returning: true,
    });

    if (updated === 0) {
      return null;
    }

    const content = await PageContent.findOne({ where: { key } });
    return content ? content.get() : null;
  },

  /**
   * 페이지 컨텐츠 생성 또는 수정
   */
  async upsert(data: PageContentCreationAttributes) {
    const [content] = await PageContent.upsert(data, {
      returning: true,
    });
    return content.get();
  },
};
