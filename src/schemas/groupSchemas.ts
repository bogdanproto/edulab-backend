import Joi from 'joi';

export const groupSchema = Joi.object({
  name: Joi.string().required(),
});

export const updateGroupSchema = Joi.object({
  name: Joi.string().optional(),
});

export const addStudentToGroupSchema = Joi.object({
  id: Joi.number().integer().required(),
});
