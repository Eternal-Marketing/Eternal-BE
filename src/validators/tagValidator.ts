export interface CreateTagPayload {
  name: string;
  slug: string;
}

export type CreateTagResult =
  | { success: true; payload: CreateTagPayload }
  | { success: false; message: string };

export function validateCreateTagBody(body: unknown): CreateTagResult {
  const b = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const name = b.name;
  const slug = b.slug;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return { success: false, message: 'Name and slug are required' };
  }
  if (!slug || typeof slug !== 'string' || !slug.trim()) {
    return { success: false, message: 'Name and slug are required' };
  }

  return {
    success: true,
    payload: { name: name.trim(), slug: slug.trim() },
  };
}
