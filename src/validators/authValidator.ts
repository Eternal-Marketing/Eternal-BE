export type LoginValidationResult =
  | { success: true; email: string; password: string }
  | { success: false; message: string };

export type RefreshTokenValidationResult =
  | { success: true; refreshToken: string }
  | { success: false; message: string };

export function validateLoginBody(body: unknown): LoginValidationResult {
  const b =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const email = b.email;
  const password = b.password;

  if (!email || typeof email !== 'string' || !email.trim()) {
    return { success: false, message: 'Email and password are required' };
  }
  if (!password || typeof password !== 'string' || !password.trim()) {
    return { success: false, message: 'Email and password are required' };
  }

  return { success: true, email: email.trim(), password: password.trim() };
}

export function validateRefreshTokenBody(
  body: unknown
): RefreshTokenValidationResult {
  const b =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const refreshToken = b.refreshToken;

  if (
    !refreshToken ||
    typeof refreshToken !== 'string' ||
    !refreshToken.trim()
  ) {
    return { success: false, message: 'Refresh token is required' };
  }

  return { success: true, refreshToken: refreshToken.trim() };
}
