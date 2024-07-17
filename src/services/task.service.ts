import taskError from '../consts/errors/taskError';
import ApiError from '../helpers/ApiError';
import { TaskStatus } from '../types';
import { taskData } from '../data';
import { Task } from '../app/task/Task';
import { UserCurrentDto } from '../data/dto';

export class TaskService {
  private taskData = taskData;
  private task = new Task();

  async getTaskById(taskId: number) {
    return await this.task.getTaskById(taskId);
  }
  async getTaskDetailsById(user: UserCurrentDto, taskId: number) {
    return await this.task.getTaskDetailsById(user, taskId);
  }

  async getTasksByUserId(user: UserCurrentDto) {
    return await this.task.getTasksByUserId(user);
  }

  async createTasksForStudentFromGroup(groupId: number, courseId: number) {
    const createdTask = await this.task.createTasksForGroupAndCourse(
      groupId,
      courseId,
    );
    return createdTask;
  }

  async addTaskGrade(taskId: number, grade: number, newStatus: TaskStatus) {
    const currentTask = await this.taskData.getTaskById(taskId);
    if (!currentTask) throw new ApiError(taskError.NOT_FOUND_ID);
    if (currentTask.grade !== null) throw new ApiError(taskError.ALREADY_EXIST);

    const task = await this.taskData.createTaskGrade(taskId, grade, newStatus);
    return task;
  }

  async deleteTaskGrade(taskId: number, newStatus: TaskStatus) {
    const task = await this.taskData.getTaskById(taskId);
    if (!task) throw new ApiError(taskError.NOT_FOUND_ID);
    if (task.grade === null) throw new ApiError(taskError.GRADE_NOT_FOUND);

    return await taskData.deleteTaskGrade(taskId, newStatus);
  }

  async updateTaskGrade(taskId: number, newGrade: number) {
    const task = await this.taskData.getTaskById(taskId);
    if (!task) throw new ApiError(taskError.NOT_FOUND_ID);
    if (task.grade === null) throw new ApiError(taskError.GRADE_NOT_FOUND);

    return await taskData.updateTaskGrade(taskId, newGrade);
  }
  async updateTaskStatus(taskId: number, newStatus: TaskStatus) {
    const task = await this.taskData.getTaskById(taskId);
    if (!task) throw new ApiError(taskError.NOT_FOUND_ID);

    return await taskData.updateTaskStatus(taskId, newStatus);
  }
  async sendHomework(
    taskId: number,
    homeworkUrl: string,
    newStatus: TaskStatus,
  ) {
    return await this.task.sendHomework(taskId, homeworkUrl, newStatus);
  }
  async getTaskRelatedParticipants(taskId: number) {
    return await this.task.getTaskRelatedParticipants(taskId);
  }
}

export const taskService = new TaskService();
