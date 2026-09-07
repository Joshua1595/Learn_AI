import api from "./api";

export const explainDocumentTopic = async (
  documentId,
  topic
) => {
  const response = await api.post(
    `/documents/${documentId}/explain`,
    {
      topic,
    }
  );

  return response.data;
};