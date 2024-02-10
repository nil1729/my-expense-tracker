const QUESTION_PREFIX = "QUESTION_ID_";
const COLUMN_PREFIX = "SHEET_COLUMN_";

function getQuestionIdColumnMapping() {
  const questions = getQuestions();
  const columns = getColumns();
  return { questions, columns };
}

function getQuestions() {
  const questions = {};
  Object.keys(process.env).forEach((envKey) => {
    if (envKey.startsWith(QUESTION_PREFIX)) {
      const id = envKey.replace(QUESTION_PREFIX, "");
      const questionId = process.env[envKey];
      questions[id] = questionId;
    }
  });
  return questions;
}

function getColumns() {
  const columns = {};
  Object.keys(process.env).forEach((envKey) => {
    if (envKey.startsWith(COLUMN_PREFIX)) {
      const id = envKey.replace(COLUMN_PREFIX, "");
      const columnName = process.env[envKey];
      columns[id] = columnName;
    }
  });
  return columns;
}

module.exports = { getQuestionIdColumnMapping };
