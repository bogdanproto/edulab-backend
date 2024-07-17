import generator from 'generate-password';

const generatePassword = () =>
  generator.generate({
    length: 15,
    numbers: true,
    lowercase: true,
    uppercase: true,
    strict: true,
    excludeSimilarCharacters: false,
    symbols: '+',
  });

export default generatePassword;
