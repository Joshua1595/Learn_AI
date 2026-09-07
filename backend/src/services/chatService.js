const pool = require("../config/db");

const createChatSession = async (
  userId,
  documentId,
  title = "New Chat"
) => {
  const result = await pool.query(
    `INSERT INTO chat_sessions
      (user_id, document_id, title)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, documentId, title]
  );

  return result.rows[0];
};

const saveChatMessage = async (
  sessionId,
  role,
  content,
  sources = null
) => {
  if (!content || !content.trim()) {
    throw new Error(
      `Cannot save empty chat message. Role: ${role}`
    );
  }

  const result = await pool.query(
    `INSERT INTO chat_messages
      (session_id, role, content, sources)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      sessionId,
      role,
      content,
      sources
        ? JSON.stringify(sources)
        : null,
    ]
  );

  return result.rows[0];
};

const getChatMessages = async (
  sessionId
) => {
  const result = await pool.query(
    `SELECT
       id,
       role,
       content,
       sources,
       created_at
     FROM chat_messages
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [sessionId]
  );

  return result.rows;
};
const getChatSessions = async (
  userId,
  documentId
) => {
  const result = await pool.query(
    `SELECT
       id,
       title,
       created_at
     FROM chat_sessions
     WHERE user_id = $1
       AND document_id = $2
     ORDER BY created_at DESC`,
    [userId, documentId]
  );

  return result.rows;
};
const deleteChatSession = async (
  sessionId,
  userId
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `DELETE FROM chat_messages
       WHERE session_id = $1`,
      [sessionId]
    );

    const result = await client.query(
      `DELETE FROM chat_sessions
       WHERE id = $1
       AND user_id = $2
       RETURNING id`,
      [sessionId, userId]
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
const updateChatSession = async (
  sessionId,
  userId,
  title
) => {
  const result = await pool.query(
    `UPDATE chat_sessions
     SET title = $1
     WHERE id = $2
     AND user_id = $3
     RETURNING id, title, created_at`,
    [
      title.trim(),
      sessionId,
      userId,
    ]
  );

  return result.rows[0];
};


module.exports = {
  createChatSession,
  saveChatMessage,
  getChatMessages,
  getChatSessions,
  deleteChatSession,
  updateChatSession,
};