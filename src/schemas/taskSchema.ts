import Joi from 'joi';

export const taskSchema = Joi.object({
  lessonId: Joi.number().integer().positive().required(),
  studentId: Joi.number().integer().positive().required(),
  status: Joi.string().valid('done', 'check', 'null').required(),
  taskType: Joi.string().valid('test', 'homework').required(),
  grade: Joi.number().integer().min(0).max(100).allow(null),
});

export const createGradeSchema = Joi.object({
  grade: Joi.number().integer().min(0).max(100).allow(null),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid('done', 'check', 'null').required(),
});

export const sendHomeworkCreateSchema = Joi.object({
  file: Joi.any(),
});
