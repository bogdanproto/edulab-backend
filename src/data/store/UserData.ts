/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import { Pool } from 'pg';
import {
  UpdateUserDto,
  UserDto,
  UserDbDto,
  UserRegistrationDataForDbDto,
} from '../dto/UserDto';
import { snakeToCamelCase } from '../../helpers';
import { Role } from '../../types';

export class UserData {
  constructor(private pool: Pool) {}

  async createUser(userData: Omit<UserDto, 'id'>): Promise<UserDto> {
    const {
      firstName,
      lastName,
      email,
      password,
      role = Role.STUDENT,
      isActivated = false,
      isSubscribedToEmails = false,
    } = userData;

    const query = `
      INSERT INTO users (first_name, last_name, email, password, role, is_activated, is_subscribed_to_emails)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      firstName,
      lastName,
      email,
      password,
      role,
      isActivated,
      isSubscribedToEmails,
    ];
    const { rows } = await this.pool.query<UserDto>(query, values);
    const newUser = snakeToCamelCase(rows[0]);

    return newUser;
  }

  async getAllUsers(): Promise<UserDto[]> {
    const query = `
      SELECT
        u.id,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        u.email,
        u.is_activated AS "isActivated",
        u.activation_link AS "activationLink",
        u.role,
        u.avatar_url AS "avatarUrl",
        u.is_subscribed_to_emails AS "isSubscribedToEmails",
        array_remove(
          array_agg(DISTINCT COALESCE(g1.name, g2.name)),
          NULL
        ) AS "groupNames"
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN groups g1 ON s.group_id = g1.id
      LEFT JOIN groups_teachers gt ON u.id = gt.teacher_user_id
      LEFT JOIN groups g2 ON gt.group_id = g2.id
      GROUP BY
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.is_activated,
        u.activation_link,
        u.role,
        u.avatar_url,
        u.is_subscribed_to_emails
    `;
    const { rows } = await this.pool.query<UserDto>(query);
    return rows;
  }

  async getUserById(userId: number): Promise<UserDto | null> {
    const query = `
      SELECT
        u.id,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        u.email,
        u.is_activated AS "isActivated",
        u.activation_link AS "activationLink",
        u.role,
        u.avatar_url AS "avatarUrl",
        u.is_subscribed_to_emails AS "isSubscribedToEmails",
        array_remove(array_agg(DISTINCT COALESCE(g1.name, g2.name)), NULL) AS "groupNames"
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN groups g1 ON s.group_id = g1.id
      LEFT JOIN groups_teachers gt ON u.id = gt.teacher_user_id
      LEFT JOIN groups g2 ON gt.group_id = g2.id
      WHERE u.id = $1
      GROUP BY
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.is_activated,
        u.activation_link,
        u.role,
        u.avatar_url,
        u.is_subscribed_to_emails
    `;

    const { rows } = await this.pool.query<UserDto>(query, [userId]);
    return rows[0];
  }

  async getUserByEmail(email: string): Promise<UserDto | null> {
    const query = `
      SELECT *
      FROM users
      WHERE email = $1
    `;
    const { rows } = await this.pool.query<UserDto>(query, [email]);
    return rows[0] ? snakeToCamelCase(rows[0]) : null;
  }

  async updateUser(userData: UpdateUserDto, userId: number): Promise<UserDto> {
    const {
      firstName,
      lastName,
      email,
      role,
      avatarUrl,
      isSubscribedToEmails,
      isActivated,
    } = userData;

    let query = `
      UPDATE users
      SET first_name = $1, last_name = $2, email = $3,
      role = $4, is_subscribed_to_emails = $5, is_activated = $6
    `;

    const values = [
      firstName,
      lastName,
      email,
      role,
      isSubscribedToEmails,
      isActivated,
    ];

    if (avatarUrl !== undefined) {
      query += ', avatar_url = $7';
      values.push(avatarUrl);
    }

    query += `
      WHERE id = $${values.length + 1}
      RETURNING id, first_name, last_name, email, is_activated,
      activation_link, role, avatar_url, is_subscribed_to_emails
    `;

    values.push(userId.toString());

    const { rows } = await this.pool.query<UserDto>(query, values);
    const updatedUser = snakeToCamelCase(rows[0]);

    return updatedUser;
  }

  async deleteUser(
    userId: number,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.getUserById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.role === Role.STUDENT) {
      const deleteStudentQuery = `
        DELETE FROM students WHERE user_id = $1
      `;
      await this.pool.query(deleteStudentQuery, [userId]);
    }

    const query = `DELETE FROM users WHERE id = $1`;
    await this.pool.query(query, [userId]);
    return { success: true, message: 'User deleted successfully' };
  }

  // Denys Shpak code is below
  async addUser(userToRegister: UserRegistrationDataForDbDto) {
    const query =
      'INSERT INTO users (first_name, last_name, email, role, password,activation_link, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';

    const result = await this.pool.query(query, [
      userToRegister.firstName,
      userToRegister.lastName,
      userToRegister.email,
      userToRegister.role,
      userToRegister.password,
      userToRegister.activationLink,
      userToRegister.avatarUrl,
    ]);

    const user: UserDbDto = result.rows[0];
    return user;
  }

  async addUsers(usersToRegister: UserRegistrationDataForDbDto[]) {
    const query =
      'INSERT INTO users (first_name, last_name, email, role, password,activation_link, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';

    const users: UserDbDto[] = [];

    for (const userToRegister of usersToRegister) {
      const result = await this.pool.query(query, [
        userToRegister.firstName,
        userToRegister.lastName,
        userToRegister.email,
        userToRegister.role,
        userToRegister.password,
        userToRegister.activationLink,
        userToRegister.avatarUrl,
      ]);
      const user: UserDbDto = result.rows[0];
      users.push(user);
    }

    return users;
  }

  async findUserById(id: string) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    const user: UserDbDto = result.rows[0];

    return user;
  }

  async findUserByEmail(email: string) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.pool.query(query, [email]);
    const user: UserDbDto = result.rows[0];
    return user;
  }

  async findUsersByEmails(emails: string[]) {
    const query = 'SELECT * FROM users WHERE email = ANY($1::text[])';
    const result = await this.pool.query(query, [emails]);
    const users: UserDbDto[] = result.rows;
    return users;
  }

  async findUserByActivationLink(activationLink: string) {
    const query = 'SELECT * FROM users WHERE activation_link = $1';
    const result = await this.pool.query(query, [activationLink]);
    const user: UserDbDto = result.rows[0];
    return user;
  }

  async activateUserById(id: number) {
    const query = 'UPDATE users SET is_activated = true WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    const user: UserDbDto = result.rows[0];
    return user;
  }

  async updateUserPasswordByEmail(email: string, newPassword: string) {
    const query = 'UPDATE users SET password = $1 WHERE email = $2';
    const values = [newPassword, email];
    const result = await this.pool.query(query, values);
    const user: UserDbDto = result.rows[0];
    return user;
  }

  async skipUserPasswordAndActivationStatus({ email, password, isActivated }) {
    const query =
      'UPDATE users SET password = $1, is_activated = $2 WHERE email = $3 RETURNING *';
    const values = [password, isActivated, email];
    const result = await this.pool.query(query, values);
    const user: UserDbDto = result.rows[0];
    return user;
  }

  async updateUserActivationLinkByEmail(
    email: string,
    newActivationLink: string,
  ) {
    const query = 'UPDATE users SET activation_link = $1 WHERE email = $2';
    const values = [newActivationLink, email];
    const result = await this.pool.query(query, values);
    const user: UserDbDto = result.rows[0];
    return user;
  }

  async addUsersWithGroups(users: UserRegistrationDataForDbDto[]) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      for (const user of users) {
        // Check if the group exists and get its ID, or insert a new group and get the new ID
        let groupResult = await client.query(
          'SELECT id FROM groups WHERE name = $1',
          [user.group],
        );

        if (groupResult.rows.length === 0) {
          groupResult = await client.query(
            'INSERT INTO groups(name) VALUES($1) RETURNING id',
            [user.group],
          );
        }

        const groupId = groupResult.rows[0].id;

        // Insert the user and get the user ID
        const userResult = await client.query(
          'INSERT INTO users(first_name, last_name, email, role, password, activation_link, avatar_url) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [
            user.firstName,
            user.lastName,
            user.email,
            user.role,
            user.password,
            user.activationLink,
            user.avatarUrl,
          ],
        );

        const userId = userResult.rows[0].id;

        // Insert into students table
        await client.query(
          'INSERT INTO students(user_id, group_id) VALUES($1, $2)',
          [userId, groupId],
        );
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
  // Denys Shpak code is higher
}
