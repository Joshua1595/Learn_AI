const pool = require("../config/db");
const axios = require("axios");
const {
  retrieveRelevantChunks,
} = require("../services/retrievalService");
const explainDocumentTopic = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        message: "Topic is required",
      });
    }

    const chunks = await retrieveRelevantChunks(
      documentId,
      topic,
      5
    );

    if (chunks.length === 0) {
      return res.status(404).json({
        message: "No relevant content found",
      });
    }

    const context = chunks
      .map(
        (chunk, index) =>
          `[Source ${index + 1}]
    Chunk Index: ${chunk.chunk_index}
    Similarity: ${chunk.similarity}
    Content:
    ${chunk.content}`
      )
      .join("\n\n");

    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/generate-answer`,
      {
        question: `
    Explain the topic "${topic}" using ONLY the provided document context.

    Rules:
    - Explain the topic clearly and simply.
    - Assume the learner is a beginner.
    - Use only information contained in the context.
    - Do not invent information.
    - Do not use outside knowledge.
    - Include important details from the context.
    - If an example is useful, use an example only when supported by the context.
    - If the context does not contain enough information to explain the topic, clearly say that the document does not provide enough information.
    `,
        context,
      }
    );

    return res.json({
      topic,
      explanation: aiResponse.data.answer,
      sources: chunks.map((chunk, index) => ({
        sourceNumber: index + 1,
        chunkIndex: chunk.chunk_index,
        similarity: Number(
          chunk.similarity
        ),
        content: chunk.content.slice(0, 500),
      })),
    });
  } catch (error) {
    console.error(
      "EXPLAIN TOPIC ERROR:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: "Failed to explain topic",
    });
  }
};
const testRetrieval = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    const chunks =
      await retrieveRelevantChunks(
        documentId,
        question,
        5
      );

    return res.json({
      question,
      documentId,
      count: chunks.length,
      chunks: chunks.map(
        (chunk, index) => ({
          rank: index + 1,
          chunkIndex:
            chunk.chunk_index,
          similarity: Number(
            chunk.similarity
          ),
          content: chunk.content,
        })
      ),
    });
  } catch (error) {
    console.error(
      "RETRIEVAL ERROR:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      message: "Retrieval failed",
    });
  }
};

module.exports = {
  explainDocumentTopic,
  testRetrieval,
};