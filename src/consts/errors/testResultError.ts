const testResultError = {
  NOT_FOUND_ID: {
    statusCode: 404,
    message: 'Test result with given id is not found',
  },

  ALREADY_EXIST: {
    statusCode: 400,
    message: 'Test result with given name already exists',
  },

  INVALID_DATA: {
    statusCode: 400,
    message: 'Please provide valid course data',
  },
};

export default testResultError;
