import { groupService } from '../services/group.service';
import { groupRes } from '../consts/index';
import { CreateGroupDto, UpdateGroupDto } from '../data/dto/GroupDto';
import { ApiResponse } from '../helpers';
import { Context } from 'koa';
import { UserCurrentDto } from '../data/dto';
import { notifyService } from '../services/notify.service';
import { notifyTypes, sourceTypes } from '../types';

export default class GroupController {
  static async getAllGroups(ctx: Context) {
    const user: UserCurrentDto = ctx.state.user;
    const data = await groupService.getAllGroups(user);
    ApiResponse.success(ctx, { ...groupRes.OK, data });
  }

  static async getGroupById(ctx: Context) {
    const data = await groupService.getGroupById(+ctx.params.id);
    ApiResponse.success(ctx, { ...groupRes.OK, data });
  }

  static async createGroup(ctx: Context) {
    const groupObj = ctx.request.body as CreateGroupDto;
    const data = await groupService.createGroup(groupObj);
    ApiResponse.success(ctx, { ...groupRes.CREATED, data });
  }

  static async updateGroupByID(ctx: Context) {
    const groupObj = ctx.request.body as UpdateGroupDto;
    const id = +ctx.params.id;
    const data = await groupService.updateGroupById(groupObj, id);
    ApiResponse.success(ctx, { ...groupRes.UPDATED, data });
  }

  static async deleteGroupById(ctx: Context) {
    const id = +ctx.params.id;
    const data = await groupService.deleteGroupById(id);
    ApiResponse.success(ctx, { ...groupRes.DELETED, data });
  }

  static async addStudentToGroup(ctx: Context) {
    const body = ctx.request.body as { id: number };
    const id = +ctx.params.id;
    const data = await groupService.addStudentToGroup(body.id, id);
    ApiResponse.success(ctx, { ...groupRes.OK, data });
  }

  static async getAllGroupStudents(ctx: Context) {
    const id = +ctx.params.id;
    const data = await groupService.getAllGroupStudents(id);
    ApiResponse.success(ctx, { ...groupRes.OK, data });
  }

  static async removeStudentFromGroup(ctx: Context) {
    const studentId = +ctx.params.studentId;
    const id = +ctx.params.id;
    const data = await groupService.addStudentToGroup(studentId, id);
    ApiResponse.success(ctx, { ...groupRes.OK, data });
  }

  static async getAllGroupCourses(ctx: Context) {
    const id = +ctx.params.id;
    const user: UserCurrentDto = ctx.state.user;
    const data = await groupService.getAllGroupCourses(id, user);
    ApiResponse.success(ctx, { ...groupRes.OK, data });
  }

  static async updateGroupCourses(ctx: Context) {
    const id = +ctx.params.id;
    const user: UserCurrentDto = ctx.state.user;
    const courses = ctx.request.body as number[];

    const data = await groupService.updateGroupCourses(id, user, courses);

    await notifyService.createNotifyForGroupStudent({
      initiatorId: user.id,
      groupId: id,
      sourceArr: data.map((item) => item.courseId),
      sourceType: sourceTypes.COURSE,
      type: notifyTypes.STUDENT_GET_COURSE,
    });

    ApiResponse.success(ctx, { ...groupRes.COURSES_ASSIGNED, data });
  }

  static async addTeacherToGroup(ctx: Context) {
    const id = +ctx.params.id;
    const teacherUId = ctx.request.body as number;
    const data = await groupService.addTeacherToGroup(teacherUId, id);
    ApiResponse.success(ctx, { ...groupRes.OK, data });
  }

  static async removeTeacherFromGroup(ctx: Context) {
    const id = +ctx.params.id;
    const teacherUId = ctx.request.body as number;
    const data = await groupService.removeTeacherFromGroup(teacherUId, id);
    ApiResponse.success(ctx, { ...groupRes.OK, data });
  }
}
