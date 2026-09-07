const fs = require("fs");
const pool = require("../config/db");
const {processDocument,createEmbeddings} = require("../services/documentProcessor");
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a document",
      });
    }

    const result = await pool.query(
      `INSERT INTO documents
       (user_id, filename, file_type, file_path, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.user.id,
        req.file.originalname,
        req.file.mimetype,
        req.file.path,
        "processing",
      ]
    );

    const document = result.rows[0];

    try {
      const processed = await processDocument(
        req.file.path
      );

      const updated = await pool.query(
        `UPDATE documents
        SET extracted_text = $1,
            original_text_length = $2,
            cleaned_text_length = $3,
            status = $4
        WHERE id = $5
        RETURNING *`,
        [
          processed.text,
          processed.original_characters,
          processed.cleaned_characters,
          "processing",
          document.id,
        ]
      );
      for (let i = 0; i < processed.chunks.length; i++) {
        const chunk = processed.chunks[i];
        const chunkTexts = processed.chunks.map(
          (chunk) => chunk.content
        );

        const embeddingResult = await createEmbeddings(
          chunkTexts
        );
        const embedding =
          embeddingResult.embeddings[i];

        await pool.query(
          `INSERT INTO document_chunks
          (
            document_id,
            chunk_index,
            content,
            character_count,
            embedding
          )
          VALUES ($1, $2, $3, $4, $5)`,
          [
            document.id,
            chunk.chunk_index,
            chunk.content,
            chunk.character_count,
            JSON.stringify(embedding),
          ]
        );
      }

      return res.status(201).json({
        message: "Document processed successfully",
        document: updated.rows[0],
      });
    } catch (processingError) {
      console.error(
        "Document processing error:",
        processingError.message
      );

      await pool.query(
        `UPDATE documents
         SET status = $1
         WHERE id = $2`,
        ["processed", document.id]
      );

      return res.status(500).json({
        message: "Document uploaded but processing failed",
      });
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Document upload failed",
    });
  }
};
const getMyDocuments = async (req, res) => {
  try {
     const result = await pool.query(
        `SELECT
          id,
          filename,
          file_type,
          status,
          extracted_text,
          created_at
        FROM documents
        WHERE user_id = $1
        ORDER BY created_at DESC`,
        [req.user.id]
    );
    res.json({
      documents: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get documents",
    });
  }
};
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    // Get the document and make sure it belongs to the logged-in user
    const result = await pool.query(
      `SELECT id, file_path
       FROM documents
       WHERE id = $1 AND user_id = $2`,
      [documentId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    const document = result.rows[0];

    // Delete document chunks first
    await pool.query(
      `DELETE FROM document_chunks
       WHERE document_id = $1`,
      [documentId]
    );

    // Delete document record
    await pool.query(
      `DELETE FROM documents
       WHERE id = $1 AND user_id = $2`,
      [documentId, req.user.id]
    );

    // Delete physical file if it exists
    if (document.file_path && fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    return res.json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    return res.status(500).json({
      message: "Failed to delete document",
    });
  }
};
module.exports = {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
};