const pool = require("../config/db");
const {
  generateSummary,
} = require("../services/llmService");

const summarizeDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const result = await pool.query(
      `SELECT content
       FROM document_chunks
       WHERE document_id = $1
       ORDER BY chunk_index ASC`,
      [documentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No document content found",
      });
    }

    const documentText = result.rows
      .map((row) => row.content)
      .join("\n\n");

    const summary = await generateSummary(
      documentText
    );
    await pool.query(
      `UPDATE documents
      SET summary = $1
      WHERE id = $2`,
      [summary, documentId]
    );

    return res.json({
      documentId,
      summary,
    });
  } catch (error) {
    console.error(
      "SUMMARIZE DOCUMENT ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to summarize document",
    });
  }
};
const getDocumentSummary = async (req, res) => {
  try {
    const { documentId } = req.params;

    const result = await pool.query(
      `SELECT summary
       FROM documents
       WHERE id = $1`,
      [documentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    return res.json({
      summary: result.rows[0].summary,
    });
  } catch (error) {
    console.error(
      "GET SUMMARY ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to get summary",
    });
  }
};

module.exports = {
  summarizeDocument,
  getDocumentSummary,
};