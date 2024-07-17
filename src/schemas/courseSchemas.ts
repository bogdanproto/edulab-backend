import Joi from 'joi';

export const courseSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  yearCourse: Joi.number().required(),
  isActive: Joi.boolean().required(),
  file: Joi.any(),
});

export const courseStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});
