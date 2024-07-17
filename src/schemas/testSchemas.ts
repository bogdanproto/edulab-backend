import Joi from 'joi';

export const questionSchema = Joi.object({
  testId: Joi.string().required(),
  questionText: Joi.string().required(),
  questionType: Joi.string().required(),
  file: Joi.any(),
  imgUrl: Joi.any(),
  answerOptions: Joi.string().required(),
});

// Joi.array().items(
//     Joi.object({
//       id: Joi.number().integer().allow(''),
//       answerText: Joi.string().required(),
//       isCorrect: Joi.boolean().required(),
//     }),
//   ),

export const testSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  maxScores: Joi.number().required(),
});

export const testResultSchema = Joi.object({
  testId: Joi.number(),
  taskId: Joi.number().required(),
  answers: Joi.array().items({
    questionId: Joi.number().integer().required(),
    answers: Joi.array().items(
      Joi.object({
        answerId: Joi.number().integer().required(),
        answerText: Joi.string(),
      }),
    ),
  }),
});

export const assignTestSchema = Joi.object({
  testId: Joi.number().integer().required(),
});
