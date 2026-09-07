import api from "./api";

export const generateDocumentQuestions = async (
  documentId
) => {
  const response = await api.post(
    `/documents/${documentId}/questions`
  );

  return response.data;
};