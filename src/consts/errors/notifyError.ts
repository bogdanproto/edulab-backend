const notifyError = {
  NOT_RELATED_USER: {
    statusCode: 400,
    message: 'The notifications provided do not apply to the user',
  },

  STATUS_WRONG: {
    statusCode: 400,
    message: 'Status of notifications is incorrect',
  },
};

export default notifyError;
