import { ContentType } from '../models/PageContent';

export interface UpsertPageContentPayload {
  key: string;
  title?: string;
  content: string;
  type: ContentType;
  isActive?: boolean;
}

export type UpsertPageContentResult =
  | { success: true; payload: UpsertPageContentPayload }
  | { success: false; message: string };

const CONTENT_TYPES = Object.values(ContentType);

export function validateUpsertPageContentBody(body: unknown): UpsertPageContentResult {
  const b = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const key = b.key;
  const content = b.content;
  const type = b.type;
  const title = b.title;
  const isActive = b.isActive;

  if (!key || typeof key !== 'string' || !key.trim()) {
    return { success: false, message: 'Key, content, and type are required' };
  }
  if (!content || typeof content !== 'string') {
    return { success: false, message: 'Key, content, and type are required' };
  }
  if (!type || typeof type !== 'string' || !CONTENT_TYPES.includes(type as ContentType)) {
    return { success: false, message: 'Key, content, and type are required' };
  }

  return {
    success: true,
    payload: {
      key: key.trim(),
      title: typeof title === 'string' ? title.trim() : undefined,
      content,
      type: type as ContentType,
      isActive: typeof isActive === 'boolean' ? isActive : undefined,
    },
  };
}
