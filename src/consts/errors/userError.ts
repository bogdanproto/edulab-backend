/* eslint-disable max-len */
const userError = {
  NOT_FOUND_ID: {
    statusCode: 404,
    message: 'User with given id is not found',
  },
  ALREADY_EXIST: {
    statusCode: 409,
    message: 'User with given email already exists',
  },
  VALID_DATA: {
    statusCode: 400,
    message: 'Please provide valid user data',
  },
  EMAIL_IS_NOT_SEND: {
    statusCode: 503,
    message: 'Error sending email',
  },
  NOT_FOUND_EMAIL: {
    statusCode: 404,
    message: 'User with given email is not found',
  },

  NOT_FOUND_LINK: {
    statusCode: 404,
    message: 'Incorrect activation link',
  },

  NOT_CREATED_PASSWORD: {
    statusCode: 401,
    message: `The password was not created, go through the password creation procedure`,
  },

  ALREADY_ACTIVATED: {
    statusCode: 409,
    message: 'User is already activated',
  },

  PASSWORD_ALREADY_CREATED: {
    statusCode: 401,
    message:
      'Your password has already been created before, so if you forgot it, click the button "Forgot password" to read instructions',
  },

  NOT_ACTIVATED: {
    statusCode: 400,
    message:
      'Your account is not activated please contact support for instructions to activate your account',
  },

  WRONG_PASSWORD: {
    statusCode: 401,
    message: `Incorrect password, if you forgot password, click on the link 'Forgot password'`,
  },

  WRONG_PASSWORD2: {
    statusCode: 401,
    message: `Incorrect password`,
  },

  WRONG_USER_DATA: {
    statusCode: 400,
    message: `A valid data was not provided for this operation`,
  },

  INVALID_CREDENTIALS: {
    statusCode: 401,
    message: 'Invalid login credentials',
  },

  NOT_FOUND_TOKEN: {
    statusCode: 401,
    message: `Token not found`,
  },

  UNAUTHORIZED: {
    statusCode: 401,
    message: 'Authentication failed',
  },

  HAS_DEPENDENCIES_STUDENT: {
    statusCode: 409,
    message:
      'Unable to delete the user because they have assigned tasks. To proceed with the deletion, please reassign or remove these tasks.',
  },

  HAS_DEPENDENCIES_TEACHER: {
    statusCode: 409,
    message:
      'Unable to delete the user because they have assigned courses. To proceed with the deletion, please reassign or remove these courses.',
  },

  NOT_ALLOWED_DELETE_SELF: {
    statusCode: 403,
    message: 'You can not delete yourself!',
  },
};

export default userError;
