import Router from 'koa-router';
import { dashboardPaths } from '../consts';
import DashboardController from '../controllers/dashboard.controller';

const router = new Router();

router.get(dashboardPaths.TEACHER, DashboardController.getDashboardTeacher);
router.get(dashboardPaths.STUDENT, DashboardController.getDashboardStudentData);

export const dashboardRouter = router;
