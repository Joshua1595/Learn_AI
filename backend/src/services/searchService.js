const pool = require("../config/db");

const searchDocumentChunks = async (
  documentId,
  queryEmbedding,
  searchText,
  limit = 10,
  minSimilarity = 0.15
) => {
  const vector = `[${queryEmbedding.join(",")}]`;

  const result = await pool.query(
    `WITH vector_results AS (
       SELECT
         id,
         document_id,
         chunk_index,
         content,
         1 - (embedding <=> $1::vector) AS vector_similarity
       FROM document_chunks
       WHERE document_id = $2
         AND embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $3
     ),

     keyword_results AS (
       SELECT
         id,
         document_id,
         chunk_index,
         content,
         ts_rank(
           to_tsvector(
             'english',
             content
           ),
           plainto_tsquery(
             'english',
             $4
           )
         ) AS keyword_score
       FROM document_chunks
       WHERE document_id = $2
         AND to_tsvector(
           'english',
           content
         ) @@ plainto_tsquery(
           'english',
           $4
         )
       ORDER BY keyword_score DESC
       LIMIT $3
     )

     SELECT
       COALESCE(v.id, k.id) AS id,
       COALESCE(v.document_id, k.document_id) AS document_id,
       COALESCE(v.chunk_index, k.chunk_index) AS chunk_index,
       COALESCE(v.content, k.content) AS content,
       COALESCE(v.vector_similarity, 0) AS similarity,
       COALESCE(k.keyword_score, 0) AS  "keywordScore"
     FROM vector_results v
     FULL OUTER JOIN keyword_results k
       ON v.id = k.id
     WHERE
       COALESCE(v.vector_similarity, 0) >= $5
       OR COALESCE(k.keyword_score, 0) > 0
     ORDER BY
       (
         COALESCE(v.vector_similarity, 0) * 0.7
       )
       +
       (
         COALESCE(k.keyword_score, 0) * 0.3
       ) DESC
     LIMIT $3`,
    [
      vector,
      documentId,
      limit,
      searchText,
      minSimilarity,
    ]
  );

  return result.rows;
};

module.exports = {
  searchDocumentChunks,
};