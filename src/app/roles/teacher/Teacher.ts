import { courseData } from '../../../data';
import { CourseDto, CreateCourseDto } from '../../../data/dto';
import { Roles } from '../Roles';

export class Teacher extends Roles {
  constructor(userId: number) {
    super(userId);
  }

  public async getMyCourses(isActive?: boolean): Promise<CourseDto[]> {
    return await courseData.getAllCourseByTeacherId(this.userId, isActive);
  }

  public async addCourse(newCourse: CreateCourseDto): Promise<CourseDto> {
    return await courseData.createCourse({
      ...newCourse,
      teacherId: this.userId,
    });
  }

  public async editCourse(
    course: CreateCourseDto,
    courseId: number,
  ): Promise<CourseDto> {
    return await courseData.updateCourseById(course, courseId);
  }

  public async setStatusCourse(
    isActive: boolean,
    courseId: number,
  ): Promise<CourseDto> {
    return await courseData.updateCourseStatusById(isActive, courseId);
  }

  public async deleteCourse(courseId: number): Promise<CourseDto> {
    return await courseData.deleteCourseById(courseId);
  }
}
