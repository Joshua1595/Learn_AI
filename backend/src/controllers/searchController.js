const {
  createQueryEmbedding,
} = require("../services/documentProcessor");

const {
  searchDocumentChunks,
} = require("../services/searchService");

const searchDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    const result = await createQueryEmbedding(
      question
    );

    const chunks = await searchDocumentChunks(
        documentId,
        result.embedding,
        5
    );

    const results = chunks
    .map((chunk) => ({
        id: chunk.id,
        chunkIndex: chunk.chunk_index,
        content: chunk.content,
        similarity: Number(
        (1 - chunk.distance).toFixed(4)
        ),
    }))
    .filter(
        (chunk) => chunk.similarity >= 0.3
    );

    res.json({
     question,
     results,
    });
  } catch (error) {
    console.error(
      "Search error:",
      error.message
    );

    res.status(500).json({
      message: "Document search failed",
    });
  }
};

module.exports = {
  searchDocument,
};