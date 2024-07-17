import { Context, Next } from 'koa';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { tokenService } from '../services/token.service';
// import { tokenData } from '../data';
import { ApiError } from '../helpers';
import { tokenError, userError } from '../consts';
import { userData } from '../data';

function isJwtPayload(object: unknown): object is JwtPayload {
  return typeof object === 'object' && object !== null && 'iat' in object;
}

const validateAuthorization = async (ctx: Context, next: Next) => {
  const authorizationHeader = ctx.headers.authorization;
  if (!authorizationHeader) {
    throw new ApiError(userError.UNAUTHORIZED);
  }

  const [bearerPrefix, accessToken] = authorizationHeader.split(' ');
  if (bearerPrefix !== 'Bearer' || !accessToken) {
    throw new ApiError(userError.UNAUTHORIZED);
  }

  const decodedUser = jwt.decode(accessToken);
  if (
    !isJwtPayload(decodedUser) ||
    decodedUser === null ||
    typeof decodedUser === 'string'
  ) {
    throw new ApiError(userError.UNAUTHORIZED);
  }

  const existingUser = await userData.findUserByEmail(decodedUser.email);
  if (!existingUser) {
    throw new ApiError(userError.UNAUTHORIZED);
  }

  const validatedUser = tokenService.validateAccessToken(accessToken);

  if (validatedUser === 'access expired' && isJwtPayload(decodedUser)) {
    // await tokenData.findTokensByFieldValue('user_id', decodedUser.id);
    throw new ApiError(tokenError.ACCESS_EXPIRED);
  }

  if (typeof validatedUser === 'string') {
    throw new ApiError(userError.UNAUTHORIZED);
  }

  if (isJwtPayload(validatedUser) && existingUser.role !== validatedUser.role) {
    throw new ApiError(userError.UNAUTHORIZED);
  }

  if (isJwtPayload(validatedUser)) {
    const userDataWithToken = { accessToken, ...validatedUser };
    ctx.state.user = userDataWithToken;
  }

  await next();
};

export default validateAuthorization;
