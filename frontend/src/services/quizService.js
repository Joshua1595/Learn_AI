import api from "./api";

export const saveQuizAttempt = async (
  documentId,
  totalQuestions,
  correctAnswers
) => {
  const response = await api.post(
    `/documents/${documentId}/quiz-attempts`,
    {
      totalQuestions,
      correctAnswers,
    }
  );

  return response.data;
};
export const getQuizAttempts = async (
  documentId
) => {
  const response = await api.get(
    `/documents/${documentId}/quiz-attempts`
  );

  return response.data;
};
export const deleteQuizAttempt = async (
  attemptId
) => {
  const response = await api.delete(
    `/quiz-attempts/${attemptId}`
  );

  return response.data;
};