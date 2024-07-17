const courseError = {
  NOT_FOUND_ID: {
    statusCode: 400,
    message: 'Course with given id is not found',
  },

  ALREADY_EXIST: {
    statusCode: 400,
    message: 'Course with given name already exists',
  },

  INVALID_DATA: {
    statusCode: 400,
    message: 'Please provide valid course data',
  },

  ALREADY_USED: {
    statusCode: 400,
    message: 'This operation was rejected because the course is already in use',
  },
};

export default courseError;
