import { Context, Next } from 'koa';

export const logRequestResults = async (ctx: Context, next: Next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(
    `${ctx.method} ${ctx.url} ${rt}	[${ctx.response.status}: ${ctx.response.message}]`,
  );
};

export const calculateResponseTime = async (ctx: Context, next: Next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
};
