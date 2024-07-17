import Router from 'koa-router';
import TaskController from '../controllers/task.controller';
import { taskPath } from '../consts';
import { uploadToS3, validateBody } from '../middlewares';
import { createGradeSchema, sendHomeworkCreateSchema } from '../schemas';

const router = new Router();

router
  .get(taskPath.ID, TaskController.getTaskDetailsById)
  .patch(
    taskPath.ID,
    validateBody(createGradeSchema),
    TaskController.addTaskGrade,
  )
  .patch(taskPath.STATUS, TaskController.updateTaskStatus)
  .get(taskPath.BASE, TaskController.getAllTasksByUserId)
  .post(
    taskPath.PASS,
    validateBody(sendHomeworkCreateSchema),
    uploadToS3({ fieldName: 'homeworkUrl' }),
    TaskController.sendHomework,
  )
  .get(taskPath.INFO, TaskController.getTeacherByTaskId)
  .delete(taskPath.ID, TaskController.deleteTaskGrade)
  .post(taskPath.CREATE, TaskController.createTasksForStudentFromGroup);

export const taskRouter = router;
