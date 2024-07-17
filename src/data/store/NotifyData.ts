import { Pool, QueryResult } from 'pg';
import {
  NotifyDto,
  NotifyDtoCreate,
  NotifyDtoExtended,
  NotifyDtoGet,
  NotifyDtoStatus,
  NotifyDtoTotal,
} from '../dto';
import { QueryByUserAndPagination, Role, notifyStatus } from '../../types';

export class NotifyData {
  constructor(private pool: Pool) {}

  async createNotify(notify: NotifyDtoCreate) {
    const query = `INSERT INTO notifications (initiator_id, recipient_id, source, source_type, notify_type, status)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;

    await this.pool.query(query, [
      notify.initiatorId,
      notify.recipientId,
      notify.source,
      notify.sourceType,
      notify.type,
      notify.status,
    ]);
  }

  async createManyNotify(notifyArr: NotifyDtoCreate[]) {
    const promises = notifyArr.map((notify) => {
      const query = `
      INSERT INTO notifications (initiator_id, recipient_id, source, source_type, notify_type, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

      const values = [
        notify.initiatorId,
        notify.recipientId,
        notify.source,
        notify.sourceType,
        notify.type,
        notify.status,
      ];

      return this.pool.query(query, values);
    });

    await Promise.all(promises);
  }

  async getNotifyByUserId({
    user,
    pagination: { cursor, limit },
  }: QueryByUserAndPagination): Promise<NotifyDtoGet> {
    const cursorCondition = cursor ? ` AND n.id <= $2` : ' AND n.id > $2';

    const getTeacherAllQuery = `
    SELECT n.id,
           n.initiator_id,
           n.recipient_id,
           n.source,
           n.source_type,
           n.notify_type,
           n.status,
           n.date,
           l.title AS lesson_title,
           c.title AS course_title,
           g.name AS group_name,
           t.task_type AS task_type
    FROM notifications n
    LEFT JOIN tasks t ON n.source = t.id AND n.source_type = 'tasks'
    LEFT JOIN lessons l ON t.lesson_id = l.id
    LEFT JOIN courses c ON l.course_id = c.id
    LEFT JOIN groups_courses gc ON c.id = gc.course_id
    LEFT JOIN groups g ON gc.group_id = g.id
    WHERE n.recipient_id = $1 AND (
        g.id IN (SELECT group_id FROM groups_teachers WHERE teacher_user_id = $1)
        AND
        g.id IN (SELECT group_id FROM students s WHERE n.initiator_id = s.user_id)
      )${cursorCondition}
    ORDER BY n.id DESC
    FETCH NEXT $3 ROWS ONLY`;

    const getStudentAllQuery = `
            SELECT 
            n.id,
            n.initiator_id,
            n.recipient_id,
            n.source,
            n.source_type,
            n.notify_type,
            n.status,
            n.date,
            CASE 
                WHEN n.source_type = 'tasks' THEN l.title
                ELSE NULL 
            END AS lesson_title,
            CASE 
                WHEN n.source_type = 'tasks' THEN c.title
                WHEN n.source_type = 'courses' THEN c2.title
                ELSE NULL 
            END AS course_title,
            CASE 
                WHEN n.source_type = 'tasks' THEN g.name
                WHEN n.source_type = 'courses' THEN g2.name
                ELSE NULL 
            END AS group_name,
            t.task_type AS task_type
                FROM notifications n
                LEFT JOIN tasks t ON n.source = t.id AND n.source_type = 'tasks'
                LEFT JOIN lessons l ON t.lesson_id = l.id
                LEFT JOIN courses c ON l.course_id = c.id
                LEFT JOIN groups_courses gc ON c.id = gc.course_id
                LEFT JOIN groups g ON gc.group_id = g.id
                LEFT JOIN courses c2 ON n.source = c2.id AND n.source_type = 'courses'
                LEFT JOIN groups_courses gc2 ON c2.id = gc2.course_id
                LEFT JOIN groups g2 ON gc2.group_id = g2.id
                LEFT JOIN students s ON s.user_id = n.recipient_id
                LEFT JOIN groups g3 ON s.group_id = g3.id
        WHERE n.recipient_id = $1${cursorCondition}
          AND (g.id = s.group_id OR g2.id = s.group_id)
        ORDER BY n.id DESC
        FETCH NEXT $3 ROWS ONLY`;

    const totalNotifyQuery = `SELECT COUNT(*) 
                        FROM notifications 
                        WHERE recipient_id = $1`;

    const totalRestedNotifyQuery = ` SELECT COUNT(*) 
                                      FROM notifications n
                                      WHERE recipient_id = $1${cursorCondition}`;

    const total = await this.pool.query(totalNotifyQuery, [user.id]);

    const restNotify = await this.pool.query(totalRestedNotifyQuery, [
      user.id,
      cursor || 0,
    ]);

    const rest = Number(restNotify.rows[0].count) - Number(limit);

    const items = await this.pool.query<NotifyDtoExtended>(
      user.role === Role.TEACHER ? getTeacherAllQuery : getStudentAllQuery,
      [user.id, cursor || 0, limit],
    );

    return {
      items: NotifyData.mapResultExtended(items),
      total: Number(total.rows[0].count),
      rest: rest >= 0 ? rest : 0,
    };
  }

  async getNotifyCountNotViewed({
    userId,
    status,
  }: NotifyDtoStatus): Promise<NotifyDtoTotal> {
    const countNotViewedQuery = `SELECT COUNT(*) 
                        FROM notifications 
                        WHERE recipient_id = $1 
                        AND status = $2`;

    const lastNotifyIdQuery = `SELECT id
                        FROM notifications
                        WHERE recipient_id = $1
                        ORDER BY date DESC
                        LIMIT 1`;

    const total = await this.pool.query(countNotViewedQuery, [userId, status]);
    const cursor = await this.pool.query(lastNotifyIdQuery, [userId]);

    return {
      status,
      total: Number(total.rows[0].count),
      cursor: cursor?.rows[0]?.id,
    };
  }

  async updateNotifyStatus(userId: number, status: notifyStatus) {
    const query = `
       UPDATE notifications 
      SET status = $1
      WHERE recipient_id = $2`;

    return await this.pool.query<NotifyDto[]>(query, [status, userId]);
  }

  async isNotifyRelateToUser(
    notifyArr: number[],
    userId: number,
  ): Promise<boolean> {
    const query = `SELECT 
                    CASE 
                      WHEN COUNT(*) = array_length($1::INTEGER[], 1) THEN true 
                      ELSE false 
                    END AS response 
                  FROM 
                    notifications 
                  WHERE 
                     id = ANY($1::INTEGER[]) 
                     AND recipient_id = $2::INTEGER`;

    const result = await this.pool.query(query, [notifyArr, userId]);

    return result.rows[0].response;
  }

  private static mapResultExtended = (res: QueryResult): NotifyDtoExtended[] =>
    res.rows.map((r) => ({
      id: r.id,
      initiatorId: r.initiator_id,
      recipientId: r.recipient_id,
      source: r.source,
      groupName: r.group_name || r.group_source,
      sourceType: r.source_type,
      lessonTitle: r.lesson_title,
      courseTitle: r.course_title || r.course_source,
      taskType: r.task_type,
      type: r.notify_type,
      status: r.status,
      date: r.date,
    }));
}
