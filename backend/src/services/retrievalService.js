const {
  createQueryEmbedding,
} = require("./documentProcessor");

const {
  searchDocumentChunks,
} = require("./searchService");

const {
  rerankChunks,
} = require("./rerankService");

const MIN_SIMILARITY = 0.15;

const retrieveRelevantChunks = async (
  documentId,
  question,
  limit = 5
) => {
  const embeddingResult =
    await createQueryEmbedding(
      question
    );

  const retrievedChunks =
    await searchDocumentChunks(
      documentId,
      embeddingResult.embedding,
      question,
      10,
      MIN_SIMILARITY
    );

  const rerankedChunks = rerankChunks(
    question,
    retrievedChunks,
    limit
  );

  const relevantChunks =
    rerankedChunks.filter(
      (chunk) =>
        Number(chunk.similarity) >=
        MIN_SIMILARITY
    );

  return relevantChunks.slice(0, limit);
};

module.exports = {
  retrieveRelevantChunks,
  MIN_SIMILARITY,
};