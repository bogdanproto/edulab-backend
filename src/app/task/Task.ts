/* eslint-disable class-methods-use-this */
import { groupError, roleError, taskError } from '../../consts';
import { groupData, taskData } from '../../data';
import {
  BaseTaskDetails,
  ExtendedDetails,
  StudentHomeworkDetails,
  StudentTestDetails,
  TaskDto,
  TeacherHomeworkDetails,
  TeacherTestDetails,
  UserCurrentDto,
} from '../../data/dto';
import { ApiError } from '../../helpers';
import { TaskStatus } from '../../types';

export class Task {
  public async createTasksForGroupAndCourse(
    groupId: number,
    courseId: number,
  ): Promise<TaskDto[]> {
    const isCourseAssignedToGroup = await groupData.isCourseAssignedToGroup(
      courseId,
      groupId,
    );

    if (!isCourseAssignedToGroup) throw new ApiError(groupError.NOT_FOUND);

    const taskDetails = await taskData.getInfoForTasks(groupId, courseId);

    const tasks: TaskDto[] = [];

    for (const detail of taskDetails) {
      const { studentId, lessonId, taskType } = detail;

      if (!studentId || !lessonId || !taskType) {
        console.error('Missing data:', { studentId, lessonId, taskType });
        continue;
      }

      const task = await taskData.createTaskForStudentsFromGroup(
        studentId,
        lessonId,
        taskType,
        TaskStatus.Null,
        null,
      );
      tasks.push(task);
    }

    return tasks;
  }
  public async getTaskById(taskId: number): Promise<TaskDto> {
    const task = (await taskData.getTaskById(taskId)) as TaskDto;
    if (!task) {
      throw new ApiError(taskError.NOT_FOUND_ID);
    }

    return task;
  }

  public async getTasksByUserId(
    user: UserCurrentDto,
  ): Promise<ExtendedDetails[] | BaseTaskDetails[]> {
    if (user.role === 'teacher') {
      const tasks = await taskData.getAllTasksByTeacher(user.id);
      return tasks;
    } else if (user.role === 'student') {
      const tasks = await taskData.getTasksByStudentId(user.id);
      return tasks;
    } else {
      throw new ApiError(roleError.NOT_RIGHTS);
    }
  }
  public async getTaskDetailsById(
    user: UserCurrentDto,
    taskId: number,
  ): Promise<
    | TeacherHomeworkDetails
    | TeacherTestDetails
    | StudentHomeworkDetails
    | StudentTestDetails
    | null
  > {
    const task = await this.getTaskById(taskId);
    if (!task) {
      throw new ApiError(taskError.NOT_FOUND_ID);
    }
    if (user.role === 'teacher') {
      switch (task.taskType) {
        case 'homework':
          return await taskData.getTaskHomeworkDetailsForTeacher(
            taskId,
            user.id,
          );
        case 'test':
          return await taskData.getTaskTestDetailsForTeacher(taskId, user.id);
        default:
          throw new ApiError(taskError.INVALID_TASK_TYPE);
      }
    } else if (user.role === 'student') {
      switch (task.taskType) {
        case 'homework':
          return await taskData.getTaskHomeworkDetailsStudent(taskId, user.id);
        case 'test':
          return await taskData.getTaskTestDetailsStudent(taskId, user.id);
        default:
          throw new ApiError(taskError.INVALID_TASK_TYPE);
      }
    } else {
      throw new ApiError(roleError.NOT_RIGHTS);
    }
  }
  public async getTaskRelatedParticipants(taskId: number) {
    const task = (await taskData.getTaskById(taskId)) as TaskDto;
    if (!task) throw new ApiError(taskError.NOT_FOUND_ID);
    return await taskData.getTaskRelatedParticipants(taskId);
  }

  async sendHomework(
    taskId: number,
    homeworkUrl: string,
    newStatus: TaskStatus,
  ) {
    const isHomework = await taskData.isHomeworkHaveResule(taskId);
    if (isHomework) throw new ApiError(taskError.HOMEWORK);

    const task = await taskData.getTaskById(taskId);
    if (!task) throw new ApiError(taskError.NOT_FOUND_ID);
    return await taskData.sendHomework(taskId, homeworkUrl, newStatus);
  }
}
