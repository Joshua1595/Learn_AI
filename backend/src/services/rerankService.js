const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
};

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "in",
  "on",
  "at",
  "to",
  "of",
  "for",
  "from",
  "and",
  "or",
  "with",
  "about",
  "what",
  "which",
  "who",
  "when",
  "where",
  "why",
  "how",
  "did",
  "does",
  "do",
  "has",
  "have",
  "had",
  "can",
  "could",
  "would",
  "should",
  "it",
  "this",
  "that",
  "they",
  "them",
  "he",
  "she",
  "his",
  "her",
  "their"
]);

const rerankChunks = (
  question,
  chunks,
  limit = 5
) => {
  const questionWords =
    tokenize(question);

  const meaningfulWords =
    questionWords.filter(
      (word) =>
        !STOP_WORDS.has(word)
    );

  const ranked = chunks.map(
    (chunk) => {
      const chunkWords =
        tokenize(chunk.content);

      const chunkSet = new Set(
        chunkWords
      );

      const vectorScore =
        Number(chunk.similarity) || 0;

      const databaseKeywordScore =
        Number(chunk.keywordScore) || 0;

      let matches = 0;

      meaningfulWords.forEach(
        (word) => {
          if (chunkSet.has(word)) {
            matches++;
          }
        }
      );

      const exactKeywordScore =
        matches /
        Math.max(
          meaningfulWords.length,
          1
        );

      const meaningfulQuestion =
        meaningfulWords.join(" ");

      const chunkText =
        chunk.content.toLowerCase();

      const phraseScore =
        meaningfulQuestion.length > 0 &&
        chunkText.includes(
          meaningfulQuestion
        )
          ? 1
          : 0;

      const densityScore =
        matches /
        Math.max(
          Math.sqrt(chunkWords.length),
          1
        );

      const finalScore =
        vectorScore * 0.40 +
        databaseKeywordScore * 0.30 +
        exactKeywordScore * 0.15 +
        phraseScore * 0.05 +
        densityScore * 0.10;

      return {
        ...chunk,
        exactKeywordScore,
        phraseScore,
        densityScore,
        finalScore
      };
    }
  );

  return ranked
    .sort(
      (a, b) =>
        b.finalScore -
        a.finalScore
    )
    .slice(0, limit);
};

module.exports = {
  rerankChunks
};