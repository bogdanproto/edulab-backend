import Joi from 'joi';

export const notifyStatusSchema = Joi.object({
  notifyArr: Joi.array().items(Joi.number()).required(),
});
