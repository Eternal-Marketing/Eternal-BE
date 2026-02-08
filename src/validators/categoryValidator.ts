export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  parentId: string | null;
  order?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  order?: number;
  isActive?: boolean;
}

export type CreateCategoryResult =
  | { success: true; payload: CreateCategoryPayload }
  | { success: false; message: string };

export type UpdateCategoryResult =
  | { success: true; payload: UpdateCategoryPayload }
  | { success: false; message: string };

function parseOrder(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

export function validateCreateCategoryBody(body: unknown): CreateCategoryResult {
  const b = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const name = b.name;
  const slug = b.slug;
  const description = b.description;
  const parentId = b.parentId;
  const order = b.order;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return { success: false, message: 'Name and slug are required' };
  }
  if (!slug || typeof slug !== 'string' || !slug.trim()) {
    return { success: false, message: 'Name and slug are required' };
  }

  return {
    success: true,
    payload: {
      name: name.trim(),
      slug: slug.trim(),
      description: typeof description === 'string' ? description.trim() : undefined,
      parentId:
        parentId === undefined || parentId === null || parentId === ''
          ? null
          : String(parentId),
      order: parseOrder(order),
    },
  };
}

export function validateUpdateCategoryBody(body: unknown): UpdateCategoryResult {
  const b = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const name = b.name;
  const slug = b.slug;
  const description = b.description;
  const parentId = b.parentId;
  const order = b.order;
  const isActive = b.isActive;

  return {
    success: true,
    payload: {
      name: typeof name === 'string' ? name.trim() : undefined,
      slug: typeof slug === 'string' ? slug.trim() : undefined,
      description: typeof description === 'string' ? description.trim() : undefined,
      parentId:
        parentId === undefined
          ? undefined
          : parentId === null
            ? null
            : String(parentId),
      order: parseOrder(order),
      isActive: typeof isActive === 'boolean' ? isActive : undefined,
    },
  };
}
