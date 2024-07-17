import { homeworkError, lessonError, materialError } from '../../consts';
import { homeWorkData, lessonData, materialData } from '../../data';
import {
  CreateHomeWorkDto,
  CreateMaterialDto,
  HomeWorkDto,
  MaterialDto,
  UpdateHomeWorkDto,
  UpdateMaterialDto,
} from '../../data/dto';
import ApiError from '../../helpers/ApiError';

export class Lesson {
  private id: number;

  constructor(id: number) {
    this.id = id;
  }

  public async getMaterials() {
    return await materialData.getAllMaterialByLesson(this.id);
  }

  public async getHomeWork() {
    return await homeWorkData.getHomeWorkByLesson(this.id);
  }

  public async addMaterial(
    materialObj: CreateMaterialDto,
  ): Promise<MaterialDto> {
    return await materialData.createMaterial({
      ...materialObj,
      lessonId: this.id,
    });
  }

  public async editMaterial(
    materialObj: UpdateMaterialDto,
  ): Promise<MaterialDto> {
    const result = await materialData.updateMaterialById({
      ...materialObj,
      lessonId: this.id,
    });

    if (!result) {
      throw new ApiError(materialError.ID_NOT_EXIST);
    }

    return result;
  }

  public async deleteMaterial(id: number): Promise<MaterialDto> {
    const result = await materialData.deleteMaterialById({
      id,
      lessonId: this.id,
    });

    if (!result) {
      throw new ApiError(materialError.ID_NOT_EXIST);
    }

    return result;
  }

  public async addHomeWork(
    homeWorkObj: CreateHomeWorkDto,
  ): Promise<HomeWorkDto> {
    return await homeWorkData.createHomeWork({
      ...homeWorkObj,
      lessonId: this.id,
    });
  }

  public async editHomeWork(
    homeWorkObj: UpdateHomeWorkDto,
  ): Promise<HomeWorkDto> {
    const result = await homeWorkData.updateHomeWorkById({
      ...homeWorkObj,
      lessonId: this.id,
    });

    if (!result) {
      throw new ApiError(homeworkError.ID_NOT_EXIST);
    }

    return result;
  }

  public async deleteHomeWork(id: number): Promise<HomeWorkDto> {
    const result = await homeWorkData.deleteHomeWorkById({
      id,
      lessonId: this.id,
    });

    if (!result) {
      throw new ApiError(homeworkError.ID_NOT_EXIST);
    }

    return result;
  }

  public async assignTest(testId: number) {
    return await lessonData.assignTestToLesson(this.id, testId);
  }

  public async removeTest() {
    return await lessonData.removeTestFromLesson(this.id);
  }

  public async isLessonHasAnyTest() {
    const result = await lessonData.getTestRelatedToLesson(this.id);

    if (result.length) {
      throw new ApiError(lessonError.ALREADY_HAS_TEST);
    }
    return result;
  }

  public async getTest() {
    const result = await lessonData.getTestByLesson(this.id);

    return result;
  }

  public async isLessonHasHomeWork() {
    const result = await homeWorkData.getHomeWorkByLesson(this.id);
    if (result.length) {
      throw new ApiError(lessonError.ALREADY_HAS_HW);
    }
    return result;
  }

  public async isLessonRelateToCourse(courseId: number) {
    const lesson = await lessonData.getLessonById(this.id);
    if (lesson.courseId !== courseId) {
      throw new ApiError(lessonError.NOT_RELATED_COURSE);
    }

    return lesson;
  }
}
