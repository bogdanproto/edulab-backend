export type AnswerDto = {
  id: number;
  answerText: string;
  isCorrect: boolean;
  questionId: number;
};

export type QuestionDto = {
  id?: number;
  questionText: string;
  testId: number;
  questionType: string;
  imgUrl: string;
  answerOptions?: AnswerDto[];
  file?: string;
};

export type CreateQuestionDto = {
  questionText: string;
  testId: number;
  questionType: string;
  imgUrl?: string;
  answerOptions: string;
  file?: string;
};

export type TestDto = {
  id?: number;
  title: string;
  description: string;
  maxScores: number;
  teacherId?: number;
  questions?: QuestionDto[];
};

export type TestsDto = {
  id?: number;
  title: string;
  description: string;
  maxScores: number;
  teacherId?: number;
  questionCount: number;
};

export type Answers = {
  questionId: number;
  answers: { answerId: number; answerText?: string }[];
};

export type TestResultDto = {
  id?: number;
  testId: number;
  taskId: number;
  scores: number;
  status: string;
  totalQuestions: number;
  correctAnswers: number;
  answers: Answers[];
};

export type CreateTestResultDto = {
  taskId: number;
  answers: Answers[];
};

export type CheckTestResultDto = {
  testId: number;
  answers: Answers[];
};

export type TestDtoId = {
  testId: number;
};
