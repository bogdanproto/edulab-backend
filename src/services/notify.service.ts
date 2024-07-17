import { Notify } from '../app/notify/Notify';
import { Init, Pagination, notifyStatus, notifyTypes } from '../types';
import {
  NotifyDtoInit,
  NotifyDtoStatus,
  NotifyGroupDtoInit,
  UserCurrentDto,
} from '../data/dto';
import { Task } from '../app/task/Task';
import { ApiError, handlePaginationObj } from '../helpers';
import { notifyError } from '../consts';
import { Group } from '../app/group/Group';
import { groupService } from './group.service';

class NotifyService {
  async createNotifyForTask({
    initiatorId,
    source,
    sourceType,
    type,
  }: NotifyDtoInit) {
    const task = new Task();
    let recipientId: number | null = null;

    if (type === notifyTypes.STUDENT_HW_DONE) {
      const { teacherUserId } = await task.getTaskRelatedParticipants(source);
      recipientId = teacherUserId;
    }

    if (type === notifyTypes.TEACHER_HW_CHECKED) {
      const { studentUserId } = await task.getTaskRelatedParticipants(source);
      recipientId = studentUserId;
    }

    const notify = new Notify({
      initiatorId,
      source,
      sourceType,
      type,
    });

    await notify.add(recipientId);
  }

  async createNotifyForGroupStudent({
    initiatorId,
    sourceArr,
    sourceType,
    groupId,
    type,
  }: NotifyGroupDtoInit) {
    const group = new Group(await groupService.getGroupById(groupId));

    const students = await group.getAllStudents();

    const notifyArr = students
      .map(({ userId }) =>
        sourceArr.map((source) => ({
          recipientId: userId,
          initiatorId,
          source,
          sourceType,
          type,
          status: notifyStatus.NOT_VIEWED,
        })),
      )
      .flat();

    await Notify.addMany(notifyArr);
  }

  async getAllNotify(
    user: UserCurrentDto,
    { cursor = null, limit = 100, init = Init.FALSE }: Pagination,
  ) {
    const pagination = handlePaginationObj({ cursor, limit, init });

    const result = await Notify.getNotifyByUserId({
      user,
      pagination,
    });

    return { ...result, init };
  }

  async getQntNotifyByStatus({ userId, status }: NotifyDtoStatus) {
    if (!Object.values(notifyStatus).includes(status)) {
      throw new ApiError(notifyError.STATUS_WRONG);
    }

    return await Notify.getQntNotifyByStatus({ userId, status });
  }

  async updateStatus(userId: number) {
    await Notify.setStatusViewed(userId);
  }
}

export const notifyService = new NotifyService();
