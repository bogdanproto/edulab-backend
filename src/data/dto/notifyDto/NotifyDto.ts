import {
  TaskType,
  notifyStatus,
  notifyTypes,
  sourceTypes,
} from '../../../types';

export type NotifyDto = {
  id: number;
  initiatorId: number;
  recipientId: number;
  source: number;
  sourceType: sourceTypes;
  type: notifyTypes;
  status: notifyStatus;
  date: string;
};

export type NotifyGroupDto = Omit<NotifyDto, 'source'> & {
  sourceArr: number[];
  groupId: number;
};

export type NotifyDtoExtended = NotifyDto & {
  courseTitle: string;
  lessonTitle: string;
  groupName: string;
  taskType: TaskType;
};

export type NotifyDtoGet = {
  items: NotifyDtoExtended[];
  total: number;
  rest: number;
};

export type NotifyDtoTotal = {
  status: notifyStatus;
  total: number;
  cursor: number;
};

export type NotifyDtoStatus = {
  userId: number;
  status: notifyStatus;
};

export type NotifyDtoInit = Omit<
  NotifyDto,
  'id' | 'recipientId' | 'status' | 'date' | 'sourceTitle'
>;

export type NotifyGroupDtoInit = Omit<
  NotifyGroupDto,
  'id' | 'recipientId' | 'status' | 'date' | 'sourceTitle'
>;

export type NotifyDtoCreate = Omit<NotifyDto, 'id' | 'date' | 'sourceTitle'>;

export type NotifyDtoPrepared = Omit<
  NotifyDto,
  'initiatorId' | 'recipientId' | 'source' | 'sourceType' | 'sourceTitle'
> & {
  message: string | null;
};

export type NotifyDtoMessage = Omit<
  NotifyDtoExtended,
  'initiatorId' | 'recipientId' | 'source' | 'id' | 'status' | 'date'
>;

export type NotifyUpdateStatus = {
  notifyArr: number[];
  userId: number;
};
