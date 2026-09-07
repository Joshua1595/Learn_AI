import api from "./api";

export const summarizeDocument = async (documentId) => {
  const response = await api.post(
    `/documents/${documentId}/summarize`
  );

  return response.data;
};
export const getDocumentSummary = async (
  documentId
) => {
  const response = await api.get(
    `/documents/${documentId}/summary`
  );

  return response.data;
};