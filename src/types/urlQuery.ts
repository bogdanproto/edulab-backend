import { UserCurrentDto } from '../data/dto';

export enum Init {
  TRUE = 'true',
  FALSE = 'false',
}

export type Pagination = {
  cursor: string | number | null;
  limit: string | number;
  init: Init;
};

export type QueryByUserAndPagination = {
  user: UserCurrentDto;
  pagination: Pagination;
};
