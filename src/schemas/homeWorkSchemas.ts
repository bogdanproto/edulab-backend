import Joi from 'joi';

export const homeWorkCreateSchema = Joi.object({
  title: Joi.string().required(),
  file: Joi.any(),
});
