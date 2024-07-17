import { ApiResponse } from '../helpers';
import { Context } from 'koa';
import { taskService } from '../services/task.service';
import { TaskStatus, notifyTypes, sourceTypes } from '../types';
import { UserCurrentDto } from '../data/dto';
import { notifyService } from '../services/notify.service';

export default class TaskController {
  static async createTasksForStudentFromGroup(ctx: Context) {
    const body = ctx.request.body as { groupId: number; courseId: number };
    const { groupId, courseId } = body;
    await taskService.createTasksForStudentFromGroup(groupId, courseId);
    ApiResponse.success(ctx, {
      status: 200,
      message: 'Tasks created successfully',
    });
  }

  static async getAllTasksByUserId(ctx: Context) {
    const user: UserCurrentDto = ctx.state.user;
    const data = await taskService.getTasksByUserId(user);
    ApiResponse.success(ctx, { status: 200, message: 'Success', data });
  }

  static async getTaskDetailsById(ctx: Context) {
    const taskId = +ctx.params.id;
    const user: UserCurrentDto = ctx.state.user;
    const data = await taskService.getTaskDetailsById(user, taskId);
    ApiResponse.success(ctx, { status: 200, message: 'Success', data });
  }

  static async addTaskGrade(ctx: Context) {
    const user: UserCurrentDto = ctx.state.user;
    const taskId = +ctx.params.id;
    const body = ctx.request.body as { grade: number };
    const { grade } = body;

    const newStatus: TaskStatus = TaskStatus.Check;

    const data = await taskService.addTaskGrade(taskId, grade, newStatus);

    await notifyService.createNotifyForTask({
      initiatorId: user.id,
      source: taskId,
      sourceType: sourceTypes.TASK,
      type: notifyTypes.TEACHER_HW_CHECKED,
    });

    ApiResponse.success(ctx, {
      status: 201,
      message: 'Task grade created successfully',
      data,
    });
  }

  static async deleteTaskGrade(ctx: Context) {
    const taskId = +ctx.params.id;
    const newStatus: TaskStatus = TaskStatus.Done;
    await taskService.deleteTaskGrade(taskId, newStatus);
    ApiResponse.success(ctx, {
      status: 200,
      message: 'Task grade deleted successfully',
    });
  }
  static async updateTaskStatus(ctx: Context) {
    const taskId = +ctx.params.id;
    const { newStatus = TaskStatus.Done } = ctx.request.body as { newStatus?: TaskStatus };
    await taskService.updateTaskStatus(taskId, newStatus);
    ApiResponse.success(ctx, {
      status: 200,
      message: 'Task status upgraded successfully',
    });
  }
  static async sendHomework(ctx: Context) {
    const user: UserCurrentDto = ctx.state.user;
    const taskId = +ctx.params.id;
    const newStatus: TaskStatus = TaskStatus.Done;
    const body = ctx.request.body as { homeworkUrl: string };
    const { homeworkUrl } = body;

    const data = await taskService.sendHomework(taskId, homeworkUrl, newStatus);

    await notifyService.createNotifyForTask({
      initiatorId: user.id,
      source: taskId,
      sourceType: sourceTypes.TASK,
      type: notifyTypes.STUDENT_HW_DONE,
    });

    ApiResponse.success(ctx, {
      status: 201,
      message: 'Homework successfully submitted',
      data,
    });
  }
  static async getTeacherByTaskId(ctx: Context) {
    const taskId = +ctx.params.id;
    const data = await taskService.getTaskRelatedParticipants(taskId);
    ApiResponse.success(ctx, {
      status: 200,
      message: 'Success',
      data,
    });
  }
}
