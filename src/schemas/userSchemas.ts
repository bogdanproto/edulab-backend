/* eslint-disable max-len */
/* eslint-disable no-control-regex */
import Joi, { Schema } from 'joi';
import { UserDto } from '../data/dto';
import { Role } from '../types/user/role';

const emailRegex =
/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const passworsRegex = /^(?=.*[a-zA-Z]).{8,}$/;
const latinAndCyrillicRegex = /^[\p{L}'\-\s]+$/u;

const userCreate: Schema<UserDto> = Joi.object({
  id: Joi.any().allow(null),
  firstName: Joi.string().pattern(new RegExp(latinAndCyrillicRegex), 'First name must contain only Latin characters.').min(2).max(50).required(),
  lastName: Joi.string().pattern(new RegExp(latinAndCyrillicRegex), 'Last name must contain only Latin characters.').min(2).max(50).required(),
  email: Joi.string().email().pattern(new RegExp(emailRegex)).required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp(passworsRegex), 'Password must contain only Latin characters.')
    .regex(/[0-9]/, 'Password must contain at least one digit.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[@#$%^&+=!]/, 'Password must contain at least one of the following symbols: "@#$%^&+=!".')
    .optional(),
  isActivated: Joi.boolean().optional(),
  activationLink: Joi.string().optional().allow(null),
  role: Joi.string().valid(...Object.values(Role)).required(),
  avatarUrl: Joi.string().optional().allow(null),
  isSubscribedToEmails: Joi.boolean().optional(),
  groupNames: Joi.alternatives().conditional('role', {
    switch: [
      {
        is: Role.TEACHER,
        then: Joi.array().items(Joi.string().max(30)).required(),
      },
      {
        is: Role.STUDENT,
        then: Joi.array().items(Joi.string().max(30)).length(1).required(),
      },
      {
        is: Joi.any().invalid(Role.TEACHER, Role.STUDENT),
        then: Joi.forbidden(),
      },
    ],
  }),
});

const userUpdate: Schema<UserDto> = Joi.object({
  id: Joi.number().integer().optional(),
  file: Joi.any().optional(),
  firstName: Joi.string().pattern(new RegExp(latinAndCyrillicRegex), 'First name must contain only Latin characters.').min(2).max(50).optional(),
  lastName: Joi.string().pattern(new RegExp(latinAndCyrillicRegex), 'Last name must contain only Latin characters.').min(2).max(50).optional(),
  email: Joi.string().email().pattern(new RegExp(emailRegex)).optional(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp(passworsRegex), 'Password must contain only Latin characters.')
    .regex(/[0-9]/, 'Password must contain at least one digit.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[@#$%^&+=!]/, 'Password must contain at least one of the following symbols: "@#$%^&+=!".')
    .optional()
    .allow(''),
  isActivated: Joi.boolean().optional(),
  activationLink: Joi.string().optional().allow(null),
  role: Joi.string().valid(...Object.values(Role)).optional(),
  // avatarUrl: Joi.string().optional().allow(null),
  isSubscribedToEmails: Joi.boolean().optional(),
  groupNames: Joi.alternatives().conditional('role', {
    switch: [
      {
        is: Role.TEACHER,
        then: Joi.array().items(Joi.string().max(30)).optional(),
      },
      {
        is: Role.STUDENT,
        then: Joi.array().items(Joi.string().max(30)).length(1).optional(),
      },
      {
        is: Joi.any().invalid(Role.TEACHER, Role.STUDENT),
        then: Joi.forbidden(),
      },
    ],
  }),
});

export const userSchemas = {
  userCreate,
  userUpdate,
};
