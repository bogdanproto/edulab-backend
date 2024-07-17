import { Pool } from 'pg';
import { TokenDto } from '../dto/TokenDto';

export class TokenData {
  constructor(private pool: Pool) {}

  async addToken(userId: number, token: string) {
    const query =
      'INSERT INTO tokens (user_id, refresh_token) VALUES ($1, $2) RETURNING *';
    const result = await this.pool.query(query, [userId, token]);
    const tokenData: TokenDto = result.rows[0];
    return tokenData;
  }

  async findTokensByFieldValue(field: string, fieldValue: number | string) {
    const query = `SELECT * FROM tokens WHERE ${field} = $1`;
    const result = await this.pool.query(query, [fieldValue]);
    const tokenData: TokenDto = result.rows[0];
    return tokenData;
  }

  async deleteTokenByRefreshTokenValue(refreshTokenValue: string) {
    const query = 'DELETE FROM tokens WHERE refresh_token = $1';
    return await this.pool.query(query, [refreshTokenValue]);
  }

  async updateRefreshTokenByUserId(userId: number, newRefreshToken: string) {
    const query = 'UPDATE tokens SET refresh_token = $1 WHERE user_id = $2';
    await this.pool.query(query, [newRefreshToken, userId]);
  }
}
