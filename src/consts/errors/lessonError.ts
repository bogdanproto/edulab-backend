const lessonError = {
  NOT_RELATED_COURSE: {
    statusCode: 400,
    message: 'Lesson does not related to Course',
  },

  ID_NOT_EXIST: {
    statusCode: 400,
    message: 'Lesson does not exist in Course',
  },
  ALREADY_HAS_TEST: {
    statusCode: 400,
    message: 'Lesson already has Test',
  },
  ALREADY_HAS_HW: {
    statusCode: 400,
    message: 'Lesson already has HomeWork',
  },
};

export default lessonError;
