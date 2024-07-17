const testRes = {
  CREATED_TEST: { status: 201, message: 'Test was created success' },
  UPDATE_TEST: { status: 200, message: 'Test was updated success' },
  DELETE_TEST: { status: 200, message: 'Test was deleted success' },
  CREATED_TEST_RESULT: {
    status: 201,
    message: 'Test result was created success',
  },
  CHECK_TEST_RESULT: {
    status: 200,
    message: 'Test result was check success',
  },
  UPDATE_TEST_RESULT: {
    status: 200,
    message: 'Test result was updated success',
  },
  DELETE_TEST_RESULT: {
    status: 200,
    message: 'Test result was deleted success',
  },
  ADD_QUESTION: { status: 201, message: 'Question was created success' },
  UPDATE_QUESTION: { status: 200, message: 'Question was updated success' },
  DELETE_QUESTION: { status: 200, message: 'Question was deleted success' },
  ADD_TO_LESSON: { status: 200, message: 'Test was added success to Lesson' },
  REMOVE_FROM_LESSON: {
    status: 200,
    message: 'Test was removed success from Lesson',
  },
};

export default testRes;
