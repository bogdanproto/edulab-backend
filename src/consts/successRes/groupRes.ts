const groupRes = {
  OK: { status: 200 },
  CREATED: { status: 201, message: 'Group was created successfuly' },
  UPDATED: { status: 200, message: 'Group was updated successfuly' },
  DELETED: { status: 200, message: 'Group was deleted successfuly' },
  COURSES_ASSIGNED: { status: 200, message: 'Courses successfully assigned' },
};

export default groupRes;
