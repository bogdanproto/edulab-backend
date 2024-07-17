import Router from 'koa-router';
import GroupController from '../controllers/group.controller';
import { groupPaths } from '../consts';
import { validateBody } from '../middlewares';
import {
  addStudentToGroupSchema,
  groupSchema,
  updateGroupSchema,
} from '../schemas';

const router = new Router();

router
  .get(groupPaths.BASE, GroupController.getAllGroups)
  .post(groupPaths.BASE, validateBody(groupSchema), GroupController.createGroup)
  .get(groupPaths.ID, GroupController.getGroupById)
  .patch(
    groupPaths.ID,
    validateBody(updateGroupSchema),
    GroupController.updateGroupByID,
  )
  .delete(groupPaths.ID, GroupController.deleteGroupById)
  .get(groupPaths.STUDENTS, GroupController.getAllGroupStudents)
  .post(
    groupPaths.STUDENTS,
    validateBody(addStudentToGroupSchema),
    GroupController.addStudentToGroup,
  )
  .get(groupPaths.COURSES, GroupController.getAllGroupCourses)
  .patch(groupPaths.COURSES, GroupController.updateGroupCourses)
  .delete(groupPaths.STUDENT, GroupController.removeStudentFromGroup)
  .post(groupPaths.TEACHERS, GroupController.addTeacherToGroup)
  .delete(groupPaths.TEACHERS, GroupController.removeTeacherFromGroup);

export const groupRouter = router;
