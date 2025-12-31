import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db';

// ----------------------------
// TypeScript 타입 정의
// ----------------------------

export enum ContentType {
  TEXT = 'TEXT',
  HTML = 'HTML',
  JSON = 'JSON',
  IMAGE = 'IMAGE',
}

export interface PageContentAttributes {
  id: string;
  key: string;
  title?: string | null;
  content: string;
  type: ContentType;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PageContentCreationAttributes = Optional<
  PageContentAttributes,
  'id' | 'title' | 'type' | 'isActive' | 'createdAt' | 'updatedAt'
>;

export class PageContentModel
  extends Model<PageContentAttributes, PageContentCreationAttributes>
  implements PageContentAttributes
{
  public id!: string;
  public key!: string;
  public title!: string | null;
  public content!: string;
  public type!: ContentType;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ----------------------------
// Sequelize 모델 초기화
// ----------------------------
PageContentModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(ContentType)),
      allowNull: false,
      defaultValue: ContentType.TEXT,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    tableName: 'page_contents',
    timestamps: true,
    underscored: true,
  }
);

export default PageContentModel;
