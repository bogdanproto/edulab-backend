import { Pool, QueryResult } from 'pg';
import { AddHomeWorkDto, HomeWorkDto } from '../dto';

export class HomeWorkData {
  constructor(private pool: Pool) {}

  async getHomeWorkByLesson(lessonId: number) {
    const query = 'SELECT * FROM homeworks WHERE lesson_id = $1';
    const result = await this.pool.query<HomeWorkDto>(query, [lessonId]);

    return HomeWorkData.mapResult(result);
  }

  async createHomeWork(homeWork: AddHomeWorkDto) {
    const query = `INSERT INTO homeworks (title, source_url, lesson_id)
     VALUES ($1, $2, $3) RETURNING *`;

    const result = await this.pool.query(query, [
      homeWork.title,
      homeWork.sourceUrl,
      homeWork.lessonId,
    ]);

    return HomeWorkData.mapResult(result)[0];
  }

  async updateHomeWorkById(homeWork: HomeWorkDto) {
    const query = `UPDATE homeworks
            SET title = $1,
            source_url = $2
            WHERE id = $3 AND lesson_id = $4
            RETURNING *`;

    const result = await this.pool.query(query, [
      homeWork.title,
      homeWork.sourceUrl,
      homeWork.id,
      homeWork.lessonId,
    ]);

    return HomeWorkData.mapResult(result)[0];
  }

  async deleteHomeWorkById({ id, lessonId }) {
    const query = `DELETE FROM homeWorks WHERE id = $1 AND lesson_id = $2 RETURNING *`;

    const result = await this.pool.query(query, [id, lessonId]);

    return HomeWorkData.mapResult(result)[0];
  }

  private static mapResult = (res: QueryResult): HomeWorkDto[] =>
    res.rows.map((r) => ({
      id: r.id,
      title: r.title,
      sourceUrl: r.source_url,
      lessonId: r.lesson_id,
    }));
}
