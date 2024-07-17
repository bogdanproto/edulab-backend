import { courseError, roleError } from '../../consts';
import { courseData, lessonData } from '../../data';
import { CreateLessonDto, LessonDto, UserCurrentDto } from '../../data/dto';
import ApiError from '../../helpers/ApiError';
import { Role } from '../../types';

export class Course {
  public id: number;

  constructor(id: number) {
    this.id = id;
  }

  public async getCourseLessons(): Promise<LessonDto[]> {
    return await lessonData.getAllLessonByCourse(this.id);
  }

  public async addLesson(lessonObj: CreateLessonDto): Promise<LessonDto> {
    return await lessonData.createLesson({ ...lessonObj, courseId: this.id });
  }

  public async editLesson(
    lessonObj: CreateLessonDto,
    id: number,
  ): Promise<LessonDto> {
    return await lessonData.updateLessonById({
      ...lessonObj,
      courseId: this.id,
      id,
    });
  }

  public async deleteLesson(id: number): Promise<LessonDto> {
    return await lessonData.deleteLessonById(id);
  }

  public async isCourseRelateToTeacher(userId: number) {
    const course = await courseData.getCourseById(this.id);

    if (course?.teacherId !== userId) {
      throw new ApiError(roleError.NOT_RIGHTS);
    }

    return course;
  }

  public async isCourseRelateToStudent(userId: number) {
    const course = await courseData.getCourseByIdForStudent({
      courseId: this.id,
      userId,
    });

    if (!course) {
      throw new ApiError(roleError.NOT_RIGHTS);
    }

    return course;
  }

  public async isCourseRelateToUser(user: UserCurrentDto) {
    if (user.role === Role.TEACHER) {
      await this.isCourseRelateToTeacher(user.id);
    }

    if (user.role === Role.STUDENT) {
      await this.isCourseRelateToStudent(user.id);
    }
  }

  public async isCourseUsed() {
    const isCourseExist = await courseData.getCourseRelatedToAnyGroup(this.id);

    if (isCourseExist) {
      throw new ApiError(courseError.ALREADY_USED);
    }

    return isCourseExist;
  }
}
