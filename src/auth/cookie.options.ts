import type { CookieOptions } from 'express';

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax', // 🔴 КЛЮЧОВЕ
  secure: false, // localhost
  maxAge: 15 * 60 * 1000,
};

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
