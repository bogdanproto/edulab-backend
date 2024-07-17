import { NotifyDtoMessage } from '../../data/dto';
import { notifyTypes } from '../../types';

export class TemplateNotify {
  static getMessage({
    type,
    taskType,
    lessonTitle,
    courseTitle,
    groupName,
  }: NotifyDtoMessage) {
    switch (type) {
      case notifyTypes.TEACHER_HW_CHECKED: {
        return `Teacher checked your ${taskType} by course: ${courseTitle}, lesson: ${lessonTitle}`;
      }

      case notifyTypes.STUDENT_HW_DONE: {
        return `Student from group: ${groupName} completed ${taskType} by
         course: ${courseTitle}, lesson: ${lessonTitle}`;
      }

      case notifyTypes.STUDENT_GET_COURSE: {
        return `Teacher has added course ${courseTitle} for your group ${groupName}. 
        You can start completing homeworks and tests`;
      }

      default: {
        return null;
      }
    }
  }
}
