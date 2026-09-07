const {
  retrieveRelevantChunks,
} = require("../services/retrievalService");

const {
  generateQuestions,
} = require("../services/llmService");

const generateDocumentQuestions = async (
  req,
  res
) => {
  try {
    const { documentId } = req.params;

    const chunks =
      await retrieveRelevantChunks(
        documentId,
        "Generate important questions that test understanding of this document",
        10
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
    Similarity: ${Number(
            chunk.similarity
          ).toFixed(4)}
    Content:
    ${chunk.content}`
      )
      .join("\n\n");

    const questions =
      await generateQuestions(
        context,
        5
      );

    return res.json({
      documentId,
      questions,
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
      "GENERATE QUESTIONS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to generate questions",
    });
  }
};

module.exports = {
  generateDocumentQuestions,
};