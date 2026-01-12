/**
 * Sequelize 모델 타입 유틸리티
 * Sequelize 모델의 get() 메서드 반환 타입을 추론하기 위한 헬퍼 타입
 */
import { Model } from 'sequelize';

/**
 * Sequelize 모델 인스턴스에서 plain object로 변환된 타입
 */
export type ModelInstance<T extends Model> =
  T extends Model<infer Attributes> ? Attributes : never;

/**
 * Sequelize 모델의 get() 메서드 반환 타입
 */
export type ModelData<T extends Model> = ReturnType<T['get']>;
