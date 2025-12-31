import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db';

// ----------------------------
// TypeScript 타입 정의
// ----------------------------

export enum ColumnStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  PRIVATE = 'PRIVATE',
}

export interface ColumnAttributes {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  thumbnailUrl?: string | null;
  status: ColumnStatus;
  authorId: string;
  categoryId?: string | null;
  viewCount: number;
  publishedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ColumnCreationAttributes = Optional<
  ColumnAttributes,
  'id' | 'excerpt' | 'thumbnailUrl' | 'status' | 'categoryId' | 'viewCount' | 'publishedAt' | 'createdAt' | 'updatedAt'
>;

export class ColumnModel
  extends Model<ColumnAttributes, ColumnCreationAttributes>
  implements ColumnAttributes
{
  public id!: string;
  public title!: string;
  public slug!: string;
  public content!: string;
  public excerpt!: string | null;
  public thumbnailUrl!: string | null;
  public status!: ColumnStatus;
  public authorId!: string;
  public categoryId!: string | null;
  public viewCount!: number;
  public publishedAt!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ----------------------------
// Sequelize 모델 초기화
// ----------------------------
ColumnModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'thumbnail_url',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ColumnStatus)),
      allowNull: false,
      defaultValue: ColumnStatus.DRAFT,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'author_id',
      references: {
        model: 'admins',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'category_id',
      references: {
        model: 'categories',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'view_count',
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'published_at',
    },
  },
  {
    sequelize,
    tableName: 'columns',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['category_id'] },
      { fields: ['author_id'] },
      { fields: ['published_at'] },
    ],
  }
);

export default ColumnModel;

