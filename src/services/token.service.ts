/* eslint-disable class-methods-use-this */
import jwt from 'jsonwebtoken';
import { tokenData } from '../data';
import { ApiError } from '../helpers';
import { tokenError } from '../consts';

class TokenService {
  generateTokens(payload: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: process.env.NODE_ENV === 'production' ? '120m' : '30d',
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '30d',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  generateActivationToken(payload: { name: string }) {
    const activateToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: '7d',
    });
    return activateToken;
  }

  generateResetPswToken(payload: { name: string }) {
    const activateToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: '1d',
    });
    return activateToken;
  }

  async saveToken(userId: number, refreshToken: string) {
    //DShpak experiment 27.05
    // const tokenInfo = await tokenData.findTokensByFieldValue('user_id', userId);
    // if (tokenInfo) {
    //   return await tokenData.updateRefreshTokenByUserId(userId, refreshToken);
    // }
    //DShpak experiment 27.05

    return await tokenData.addToken(userId, refreshToken);
  }

  async removeToken(refreshToken: string) {
    const tokenInfo = await tokenData.deleteTokenByRefreshTokenValue(
      refreshToken,
    );
    return tokenInfo.rowCount;
  }

  async findToken(refreshToken: string) {
    return await tokenData.findTokensByFieldValue(
      'refresh_token',
      refreshToken,
    );
  }

  validateAccessToken(token: string) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
      return userData;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return 'access expired';
      } else {
        return null;
      }
    }
  }

  validateToken(token: string) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
      return userData;
    } catch (err) {
      return null;
    }
  }

  validateRefreshToken(token: string) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
      return userData;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new ApiError(tokenError.REFRESH_EXPIRED);
      } else {
        throw new ApiError(tokenError.INVALID);
      }
    }
  }
}

export const tokenService = new TokenService();
