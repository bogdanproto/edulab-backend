const errors = {
  SERVER_ERR: {
    statusCode: 500,
    message: 'Internal Server Error',
  },

  NOT_FOUND_ID: { statusCode: 404, message: 'Not Found Id' },

  BAD_ID: { statusCode: 400, message: 'Id is incorrect' },

  NOT_FOUND: { statusCode: 404, message: 'Not Found' },

  VALID_DATA: {
    statusCode: 400,
    message: 'Please provide valid data',
  },

  BAD_PARAMS: {
    statusCode: 400,
    message:
      'The parameters of the request are incorrect or have the wrong type',
  },

  BAD_QUERY_PARAMS: {
    statusCode: 400,
    message:
      'The query parameters of the request are incorrect or have the wrong type',
  },

  UNSUPPORTED_TYPE: {
    statusCode: 415,
    message: 'Unsupported Media Type',
  },

  UNAUTHORIZED: {
    statusCode: 401,
    message: 'Unauthorized',
  },

  FORBIDDEN: {
    statusCode: 403,
    message: 'Forbidden',
  },
};

export default errors;
