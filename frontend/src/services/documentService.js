
import api from "./api";
import { getToken } from "../utils/storage";

export const uploadDocument = async (file) => {
  const formData = new FormData();

  formData.append("document", file);

  const response = await api.post(
    "/documents",
    formData,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getMyDocuments = async () => {
  const response = await api.get(
    "/documents",
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await api.delete(
    `/documents/${documentId}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  return response.data;
};

