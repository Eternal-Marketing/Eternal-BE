import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db';

// ----------------------------
// TypeScript 타입 정의
// ----------------------------

export interface TagAttributes {
  id: string;
  name: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TagCreationAttributes = Optional<
  TagAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class TagModel
  extends Model<TagAttributes, TagCreationAttributes>
  implements TagAttributes
{
  public id!: string;
  public name!: string;
  public slug!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ----------------------------
// Sequelize 모델 초기화
// ----------------------------
TagModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'tags',
    timestamps: true,
    underscored: true,
  }
);

export default TagModel;
