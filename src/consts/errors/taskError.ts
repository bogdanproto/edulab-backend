const taskError = {
  NOT_FOUND_ID: {
    statusCode: 404,
    message: 'Task with given id is not found',
  },

  GRADE_NOT_FOUND: {
    statusCode: 404,
    message: 'Grade for the task is not found',
  },
  ALREADY_EXIST: {
    statusCode: 400,
    message: 'Grade with given name already exists',
  },

  INVALID_GRADE: {
    statusCode: 400,
    message: 'Invalid grade value. Please provide a valid grade.',
  },

  INVALID_TASK_DATA: {
    statusCode: 400,
    message: 'Invalid task data. Please provide valid task details.',
  },

  TASK_CREATION_FAILED: {
    statusCode: 500,
    message:
      'Failed to create task. Please check the provided data and try again.',
  },
  INVALID_TASK_TYPE: {
    statusCode: 400,
    message: 'Invalid task type. Please provide valid task details.',
  },
  HOMEWORK: {
    statusCode: 400,
    message: 'Homework already have result.',
  },
};

export default taskError;
