import Joi from 'joi';

export const lessonCreateSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  orderNumber: Joi.number().required(),
});
