import { Course } from '../app/course/Course';
import { Lesson } from '../app/course/Lesson';
import { errors } from '../consts';
import {
  MaterialArg,
  MaterialArgCreate,
  MaterialArgDelete,
  MaterialArgGetAll,
} from '../data/dto';
import { ApiError } from '../helpers';

class MaterialService {
  async getAllMaterialsByLesson({
    courseId,
    lessonId,
    user,
  }: MaterialArgGetAll) {
    if (isNaN(lessonId) || isNaN(courseId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToUser(user);

    const lesson = new Lesson(lessonId);
    await lesson.isLessonRelateToCourse(courseId);

    return lesson.getMaterials();
  }

  async createMaterial({
    materialObj,
    courseId,
    lessonId,
    user,
  }: MaterialArgCreate) {
    if (isNaN(lessonId) || isNaN(courseId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToTeacher(user.id);

    const lesson = new Lesson(lessonId);
    await lesson.isLessonRelateToCourse(courseId);

    return await lesson.addMaterial(materialObj);
  }

  async updateMaterial({
    materialObj,
    courseId,
    lessonId,
    id,
    user,
  }: MaterialArg) {
    if (isNaN(lessonId) || isNaN(courseId) || isNaN(id)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToTeacher(user.id);

    const lesson = new Lesson(lessonId);
    await lesson.isLessonRelateToCourse(courseId);

    return await lesson.editMaterial({ ...materialObj, id });
  }

  async deleteMaterial({ id, courseId, lessonId, user }: MaterialArgDelete) {
    if (isNaN(lessonId) || isNaN(courseId) || isNaN(id)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToTeacher(user.id);

    const lesson = new Lesson(lessonId);
    await lesson.isLessonRelateToCourse(courseId);

    return await lesson.deleteMaterial(id);
  }
}

export const materialService = new MaterialService();
