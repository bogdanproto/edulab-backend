const studentError = {
  NOT_FOUND_ID: {
    statusCode: 400,
    message: 'Student with given id is not found',
  },

  VALID_DATA: {
    statusCode: 400,
    message: 'Please provide valid student data',
  },
};

export default studentError;
