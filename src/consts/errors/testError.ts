const testError = {
  NOT_FOUND_ID: {
    statusCode: 404,
    message: 'Test with given id is not found',
  },

  NOT_FOUND_TASK_ID: {
    statusCode: 404,
    message: 'Test for this task not found',
  },

  INVALID_DATA: {
    statusCode: 400,
    message: 'Please provide valid course data',
  },
  ALREADY_USED: {
    statusCode: 400,
    message: 'This operation was rejected because the test is already in use',
  },
};

export default testError;
