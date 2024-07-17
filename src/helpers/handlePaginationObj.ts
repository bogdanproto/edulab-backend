import { errors } from '../consts';
import { Init, Pagination } from '../types';
import ApiError from './ApiError';

const handlePaginationObj = <P extends Pagination>({
  cursor,
  limit,
  init,
}: P): P => {
  if (!Object.values(Init).includes(init)) {
    throw new ApiError(errors.BAD_QUERY_PARAMS);
  }

  if (!cursor || cursor === 'null') {
    return { cursor: null, limit } as P;
  }

  const numCursor = Number(cursor);
  const numLimit = Number(limit);

  if (isNaN(numCursor) || isNaN(numLimit) || numCursor < 0 || numLimit < 1) {
    throw new ApiError(errors.BAD_QUERY_PARAMS);
  }

  return { cursor, limit } as P;
};

export default handlePaginationObj;
