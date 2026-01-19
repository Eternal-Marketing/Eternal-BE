import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db';

// ----------------------------
// TypeScript 타입 정의
// ----------------------------

export interface ColumnTagAttributes {
  id: string;
  columnId: string;
  tagId: string;
  createdAt?: Date;
}

export type ColumnTagCreationAttributes = Optional<
  ColumnTagAttributes,
  'id' | 'createdAt'
>;

export class ColumnTagModel
  extends Model<ColumnTagAttributes, ColumnTagCreationAttributes>
  implements ColumnTagAttributes
{
  public id!: string;
  public columnId!: string;
  public tagId!: string;

  public readonly createdAt!: Date;
}

// ----------------------------
// Sequelize 모델 초기화
// ----------------------------
ColumnTagModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    columnId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'column_id',
      references: {
        model: 'columns',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    tagId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'tag_id',
      references: {
        model: 'tags',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'column_tags',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['column_id', 'tag_id'],
      },
    ],
  }
);

export default ColumnTagModel;
