import { Context, Next } from 'koa';
import { Schema } from 'joi';
import ApiError from '../helpers/ApiError';
import { unlinkUploadsOnError } from '../helpers';

const validateBody = (schema: Schema) => async (ctx: Context, next: Next) => {
  const { error } = schema.validate(ctx.request.body);
  if (error) {
    if (ctx.request.files && Object.prototype.hasOwnProperty.call(ctx.request.files, 'file')) unlinkUploadsOnError(ctx);

    throw new ApiError({
      statusCode: 400,
      message: error.message,
      errorDetail: error,
    });
  }

  await next();
};

export default validateBody;
