import { Context } from 'koa';
import { ApiResponse } from '../helpers';

const pageNotFound = (ctx: Context) => {
  ApiResponse.pageNotFoundError(ctx);
};

export default pageNotFound;
