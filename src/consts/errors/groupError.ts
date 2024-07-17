const groupError = {
  NOT_FOUND: {
    statusCode: 400,
    message: 'Group not found',
  },

  ALREADY_EXIST: {
    statusCode: 400,
    message: 'Group with given name already exists',
  },

  VALID_DATA: {
    statusCode: 400,
    message: 'Please provide valid group data',
  },

  STUDENTS_ASSIGNED: {
    statusCode: 400,
    message: 'Unable to delete group. Students are associated with the group',
  },

  COURSE_ASSIGNED: {
    statusCode: 400,
    message: 'Unable to unassign course. Students already has tasks from it',
  },
};

export default groupError;
