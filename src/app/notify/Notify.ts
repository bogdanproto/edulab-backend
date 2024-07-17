import { notifyData } from '../../data';
import {
  NotifyDtoCreate,
  NotifyDtoExtended,
  NotifyDtoInit,
  NotifyDtoPrepared,
  NotifyDtoStatus,
  NotifyUpdateStatus,
} from '../../data/dto';
import {
  QueryByUserAndPagination,
  notifyStatus,
  notifyTypes,
  sourceTypes,
} from '../../types';
import { TemplateNotify } from './TemplateNotify';

export class Notify {
  private initiatorId: number;
  private source: number;
  private sourceType: sourceTypes;
  private type: notifyTypes;

  constructor({ initiatorId, source, sourceType, type }: NotifyDtoInit) {
    this.initiatorId = initiatorId;
    this.source = source;
    this.sourceType = sourceType;
    this.type = type;
  }

  public async add(recipientId: number | null) {
    if (!recipientId) {
      return;
    }

    await notifyData.createNotify({
      recipientId,
      initiatorId: this.initiatorId,
      source: this.source,
      sourceType: this.sourceType,
      type: this.type,
      status: notifyStatus.NOT_VIEWED,
    });
  }

  static async addMany(notifyArr: NotifyDtoCreate[]) {
    if (notifyArr.length <= 0) {
      return;
    }

    await notifyData.createManyNotify(notifyArr);
  }

  static async getNotifyByUserId({
    user,
    pagination,
  }: QueryByUserAndPagination) {
    const { items, ...commonData } = await notifyData.getNotifyByUserId({
      user,
      pagination,
    });

    return { ...commonData, items: this.prepareNotify(items) };
  }

  static async getQntNotifyByStatus({ userId, status }: NotifyDtoStatus) {
    return await notifyData.getNotifyCountNotViewed({ userId, status });
  }

  static async setStatusViewed(userId: number) {
    const status = notifyStatus.VIEWED;
    await notifyData.updateNotifyStatus(userId, status);
  }

  static async isNotifyRelateToUser({ notifyArr, userId }: NotifyUpdateStatus) {
    return await notifyData.isNotifyRelateToUser(notifyArr, userId);
  }

  private static prepareNotify(arr: NotifyDtoExtended[]): NotifyDtoPrepared[] {
    return arr.map(
      ({
        id,
        status,
        date,
        type,
        sourceType,
        lessonTitle,
        courseTitle,
        groupName,
        taskType,
      }) => ({
        id,
        status,
        type,
        date,
        message: TemplateNotify.getMessage({
          type,
          sourceType,
          lessonTitle,
          courseTitle,
          taskType,
          groupName,
        }),
      }),
    );
  }
}
