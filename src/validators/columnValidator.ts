import { ColumnStatus } from '../models/Column';

export interface CreateColumnPayload {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnailUrl?: string;
  status: ColumnStatus;
  categoryId?: string;
  tagIds?: string[];
}

export type CreateColumnResult =
  | { success: true; payload: CreateColumnPayload }
  | { success: false; message: string };

export type UpdateStatusResult =
  | { success: true; status: ColumnStatus }
  | { success: false; message: string };

const COLUMN_STATUSES = Object.values(ColumnStatus);

export function validateCreateColumnBody(body: unknown): CreateColumnResult {
  const b = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const title = b.title;
  const slug = b.slug;
  const content = b.content;
  const excerpt = b.excerpt;
  const thumbnailUrl = b.thumbnailUrl;
  const status = b.status ?? 'DRAFT';
  const categoryId = b.categoryId;
  const tagIds = b.tagIds;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return { success: false, message: 'Title, slug, and content are required' };
  }
  if (!slug || typeof slug !== 'string' || !slug.trim()) {
    return { success: false, message: 'Title, slug, and content are required' };
  }
  if (!content || typeof content !== 'string') {
    return { success: false, message: 'Title, slug, and content are required' };
  }
  if (
    typeof status !== 'string' ||
    !COLUMN_STATUSES.includes(status as ColumnStatus)
  ) {
    return { success: false, message: 'Invalid status value' };
  }

  return {
    success: true,
    payload: {
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: typeof excerpt === 'string' ? excerpt.trim() : undefined,
      thumbnailUrl: typeof thumbnailUrl === 'string' ? thumbnailUrl.trim() : undefined,
      status: status as ColumnStatus,
      categoryId: typeof categoryId === 'string' ? categoryId : undefined,
      tagIds: Array.isArray(tagIds)
        ? (tagIds.filter((id): id is string => typeof id === 'string') as string[])
        : undefined,
    },
  };
}

export function validateUpdateStatusBody(body: unknown): UpdateStatusResult {
  const b = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const status = b.status;

  if (!status || typeof status !== 'string') {
    return { success: false, message: 'Status is required' };
  }
  if (!COLUMN_STATUSES.includes(status as ColumnStatus)) {
    return { success: false, message: 'Invalid status value' };
  }

  return { success: true, status: status as ColumnStatus };
}
