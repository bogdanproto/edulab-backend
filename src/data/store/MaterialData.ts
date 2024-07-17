import { Pool, QueryResult } from 'pg';
import { AddMaterialDto, MaterialDto } from '../dto';

export class MaterialData {
  constructor(private pool: Pool) {}

  async getAllMaterialByLesson(lessonId: number) {
    const query = 'SELECT * FROM materials WHERE lesson_id = $1';
    const result = await this.pool.query<MaterialDto>(query, [lessonId]);

    return MaterialData.mapResult(result);
  }

  async createMaterial(material: AddMaterialDto) {
    const query = `INSERT INTO materials (title, source_url, lesson_id)
     VALUES ($1, $2, $3) RETURNING *`;

    const result = await this.pool.query(query, [
      material.title,
      material.sourceUrl,
      material.lessonId,
    ]);

    return MaterialData.mapResult(result)[0];
  }

  async updateMaterialById(material: MaterialDto) {
    const query = `UPDATE materials
            SET title = $1,
            source_url = $2
            WHERE id = $3 AND lesson_id = $4
            RETURNING *`;

    const result = await this.pool.query(query, [
      material.title,
      material.sourceUrl,
      material.id,
      material.lessonId,
    ]);

    return MaterialData.mapResult(result)[0];
  }

  async deleteMaterialById({ id, lessonId }) {
    const query = `DELETE FROM materials WHERE id = $1 AND lesson_id = $2 RETURNING *`;

    const result = await this.pool.query(query, [id, lessonId]);

    return MaterialData.mapResult(result)[0];
  }

  private static mapResult = (res: QueryResult): MaterialDto[] =>
    res.rows.map((r) => ({
      id: r.id,
      title: r.title,
      sourceUrl: r.source_url,
      lessonId: r.lesson_id,
    }));
}
