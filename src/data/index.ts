import { Pool } from 'pg';
import { StudentData } from './store/StudentData';
import { GroupData } from './store/GroupData';
import { CourseData } from './store/CourseData';
import { LessonData } from './store/LessonData';
import { TestData } from './store/TestData';
import { TestResultData } from './store/TestResultData';
import { UserData } from './store/UserData';

import dotenv from 'dotenv';
import { MaterialData } from './store/MaterialData';
import { HomeWorkData } from './store/HomeWorkData';
import { TokenData } from './store/TokenData';
import { TaskData } from './store/TaskData';
import { NotifyData } from './store/NotifyData';
import { DashboardData } from './store/DashboardData';
dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: 5432,
});

export const studentData = new StudentData(pool);
export const groupData = new GroupData(pool);
export const courseData = new CourseData(pool);
export const lessonData = new LessonData(pool);
export const materialData = new MaterialData(pool);
export const homeWorkData = new HomeWorkData(pool);
export const testData = new TestData(pool);
export const testResultData = new TestResultData(pool);
export const userData = new UserData(pool);
export const tokenData = new TokenData(pool);
export const taskData = new TaskData(pool);
export const notifyData = new NotifyData(pool);
export const dashboardData = new DashboardData(pool);
export { pool };
