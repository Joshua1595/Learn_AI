const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

const processDocument = async (filePath) => {
  const formData = new FormData();

  formData.append(
    "file",
    fs.createReadStream(filePath)
  );

  const response = await axios.post(
    `${AI_SERVICE_URL}/process-pdf`,
    formData,
    {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );

  return response.data;
};

const createEmbeddings = async (texts) => {
  const response = await axios.post(
    `${AI_SERVICE_URL}/create-embeddings`,
    {
      texts,
    }
  );

  return response.data;
};
const createQueryEmbedding = async (text) => {
  const response = await axios.post(
    `${AI_SERVICE_URL}/create-query-embedding`,
    {
      text,
    }
  );

  return response.data;
};
module.exports = {
  processDocument,
  createEmbeddings,
  createQueryEmbedding,
};