import AdminModel from './Admin';
import CategoryModel from './Category';
import TagModel from './Tag';
import ColumnModel from './Column';
import ColumnTagModel from './ColumnTag';
import PageContentModel from './PageContent';
import MediaModel from './Media';
import SubscriptionModel from './Subscription';

// ----------------------------
// 관계 설정 (Associations)
// ----------------------------

// Admin 관계
AdminModel.hasMany(ColumnModel, {
  foreignKey: 'authorId',
  as: 'columns',
});

AdminModel.hasMany(MediaModel, {
  foreignKey: 'uploadedBy',
  as: 'media',
});

// Category 관계
CategoryModel.belongsTo(CategoryModel, {
  foreignKey: 'parentId',
  as: 'parent',
});

CategoryModel.hasMany(CategoryModel, {
  foreignKey: 'parentId',
  as: 'children',
});

CategoryModel.hasMany(ColumnModel, {
  foreignKey: 'categoryId',
  as: 'columns',
});

// Column 관계
ColumnModel.belongsTo(AdminModel, {
  foreignKey: 'authorId',
  as: 'author',
});

ColumnModel.belongsTo(CategoryModel, {
  foreignKey: 'categoryId',
  as: 'category',
});

ColumnModel.hasMany(ColumnTagModel, {
  foreignKey: 'columnId',
  as: 'tags',
});

// Tag 관계
TagModel.hasMany(ColumnTagModel, {
  foreignKey: 'tagId',
  as: 'columns',
});

// ColumnTag 관계 (다대다)
ColumnTagModel.belongsTo(ColumnModel, {
  foreignKey: 'columnId',
  as: 'column',
});

ColumnTagModel.belongsTo(TagModel, {
  foreignKey: 'tagId',
  as: 'tag',
});

// Media 관계
MediaModel.belongsTo(AdminModel, {
  foreignKey: 'uploadedBy',
  as: 'uploader',
});

export {
  AdminModel,
  CategoryModel,
  TagModel,
  ColumnModel,
  ColumnTagModel,
  PageContentModel,
  MediaModel,
  SubscriptionModel,
};
