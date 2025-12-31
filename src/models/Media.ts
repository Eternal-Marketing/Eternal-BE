import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db';

// ----------------------------
// TypeScript 타입 정의
// ----------------------------

export interface MediaAttributes {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MediaCreationAttributes = Optional<
  MediaAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class MediaModel
  extends Model<MediaAttributes, MediaCreationAttributes>
  implements MediaAttributes
{
  public id!: string;
  public originalName!: string;
  public fileName!: string;
  public mimeType!: string;
  public size!: number;
  public url!: string;
  public uploadedBy!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ----------------------------
// Sequelize 모델 초기화
// ----------------------------
MediaModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'original_name',
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'file_name',
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'mime_type',
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'uploaded_by',
      references: {
        model: 'admins',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'media',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['uploaded_by'] },
    ],
  }
);

export default MediaModel;

