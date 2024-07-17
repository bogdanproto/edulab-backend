import Joi from 'joi';

export const materialCreateSchema = Joi.object({
  title: Joi.string().required(),
  file: Joi.any(),
});
