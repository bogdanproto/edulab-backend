import { Context } from 'koa';

export default function setRefreshTokenCookie(
  ctx: Context,
  refreshToken: string,
) {
  ctx.cookies.set('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
    httpOnly: true,
    // secure: true,
    // sameSite: 'lax', // Дозволити кросс-сайтові запити між localhost
  });
}
