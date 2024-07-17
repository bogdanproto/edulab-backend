/* eslint-disable max-len */
import Joi from 'joi';

const userRegistration = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.base': 'Last name must be a string',
    'string.empty': 'Last name is required',
    'string.min': 'First name must have at least {#limit} characters',
    'string.max': 'First name cannot exceed {#limit} characters',
    'any.required': 'First name is required',
  }),

  lastName: Joi.string().min(2).max(50).required().messages({
    'string.base': 'Last name must be a string',
    'string.empty': 'Last name is required',
    'string.min': 'Last name must have at least {#limit} characters',
    'string.max': 'Last name cannot exceed {#limit} characters',
    'any.required': 'Last name is required',
  }),

  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),

  role: Joi.string().valid('student', 'teacher', 'admin').required().messages({
    'string.base': 'Role must be a string',
    'string.empty': 'Role is required',
    'any.only': 'Role must be one of [student, teacher, admin]',
    'any.required': 'Role is required',
  }),
});

const importUsers = Joi.array().items(
  Joi.object({
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.base': 'Last name must be a string',
      'string.empty': 'Last name is required',
      'string.min': 'Last name must have at least {#limit} characters',
      'string.max': 'Last name cannot exceed {#limit} characters',
      'any.required': 'Last name is required',
    }),

    lastName: Joi.string().min(2).max(50).required().messages({
      'string.base': 'Last name must be a string',
      'string.empty': 'Last name is required',
      'string.min': 'Last name must have at least {#limit} characters',
      'string.max': 'Last name cannot exceed {#limit} characters',
      'any.required': 'Last name is required',
    }),

    email: Joi.string().email().required().messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
    group: Joi.string().required().messages({
      'string.base': 'Group must be a string',
      'string.empty': 'Group is required',
      'any.required': 'Group is required',
    }),
  }),
);

const userSignIn = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string()
    .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long',
      'any.required': 'Password is required',
    }),
});

const changePassword = Joi.object({
  oldPassword: Joi.string()
    .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long',
      'any.required': 'Password is required',
    }),

  newPassword: Joi.string()
    .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/)
    .required()
    .not(Joi.ref('oldPassword'))
    .messages({
      'string.pattern.base':
        'New password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long',
      'any.required': 'New password is required',
      'any.invalid': 'New password cannot be the same as the old password',
    }),
});

const createPassword = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string()
    .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long',
      'any.required': 'New password is required',
    }),

  activationLink: Joi.string().required().messages({
    'string.base': 'Activation link must be a string',
    'any.required': 'Activation link is a required field',
  }),
});

export const recoverCredentials = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
});

export const authSchemas = {
  userRegistration,
  importUsers,
  userSignIn,
  changePassword,
  createPassword,
  recoverCredentials,
};
