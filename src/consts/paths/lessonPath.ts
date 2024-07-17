const lessonPaths = {
  ROOT: '/api/courses/:courseId/lessons',
  BASE: '/',
  ID: '/:id',
  ASSIGN_TEST: '/:lessonId/addtest',
  REMOVE_TEST: '/:lessonId/removetest',
  LESSON_TEST: '/:lessonId/tests',
};

export default lessonPaths;
