export class Material {
  private id: number | null;
  private lessonId: number;
  private title: string;
  private source: string;

  constructor({ id = null, lessonId, title, source }) {
    this.id = id;
    this.lessonId = lessonId;
    this.title = title;
    this.source = source;
  }

  async createMaterial() {}
}
