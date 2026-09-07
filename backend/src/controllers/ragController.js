const pool = require("../config/db");
const {
  createQueryEmbedding,
} = require("../services/documentProcessor");

const {
  searchDocumentChunks,
} = require("../services/searchService");

const {
  generateRagAnswer,
  rewriteQuestion ,
} = require("../services/ragService");
const {
  createChatSession,
  saveChatMessage,
  getChatMessages,
  getChatSessions,
  deleteChatSession,
  updateChatSession,
} = require("../services/chatService");
const {
  rerankChunks,
} = require("../services/rerankService");

const {
  generateRagAnswerStream,
} = require("../services/llmService");

const askDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { question } = req.body;
    const userId = req.user.id;
    let { sessionId } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    let currentSessionId = sessionId;

    // 1. Create session if needed
    if (!currentSessionId) {
      const title =
        question.trim().slice(0, 50) +
        (question.trim().length > 50
          ? "..."
          : "");

      const session = await createChatSession(
        userId,
        documentId,
        title
      );

      currentSessionId = session.id;
    }

    // 2. Load previous conversation
    const previousMessages =
      await getChatMessages(
        currentSessionId
      );

    // 3. Build conversation history
    const conversationHistory =
      (previousMessages || [])
        .slice(-6)
        .map(
          (message) =>
            `${message.role}: ${message.content}`
        )
        .join("\n");

    console.log(
      "CONVERSATION HISTORY:",
      conversationHistory
    );

    // 4. Rewrite current question
    let standaloneQuestion =
      await rewriteQuestion(
        question.trim(),
        conversationHistory
      );

    if (
      !standaloneQuestion ||
      typeof standaloneQuestion !== "string"
    ) {
      standaloneQuestion = question.trim();
    }

    console.log(
      "STANDALONE QUESTION:",
      standaloneQuestion
    );

    // 5. Save current user question
    await saveChatMessage(
      currentSessionId,
      "user",
      question.trim()
    );

    // 6. Create embedding from standalone question
    const embeddingResult =
      await createQueryEmbedding(
        standaloneQuestion
      );
    const retrievedChunks =
      await searchDocumentChunks(
        documentId,
        embeddingResult.embedding,
        standaloneQuestion,
        10,
        0.15
      );
    // 7. Search relevant chunks
     const chunks = rerankChunks(
      standaloneQuestion,
      retrievedChunks,
      5
    );
    console.log(
      "RERANKED CHUNKS:",
      chunks.map((chunk) => ({
        index: chunk.chunk_index,
        similarity: Number(
          chunk.similarity.toFixed(4)
        ),
        keywordScore: Number(
          chunk.keywordScore.toFixed(4)
        ),
        finalScore: Number(
          chunk.finalScore.toFixed(4)
        ),
      }))
    );
    const filteredChunks = chunks
      .filter(
        (chunk) =>
          Number(chunk.similarity) >= 0.15
      )
      .slice(0, 3);

    // 8. No relevant information
    if (filteredChunks.length === 0) {
      const answer =
        "I couldn't find the answer in the document.";

      await saveChatMessage(
        currentSessionId,
        "assistant",
        answer,
        []
      );

      return res.json({
        sessionId: currentSessionId,
        question: question.trim(),
        answer,
        sources: [],
      });
    }

    // 9. Build context
    const context = filteredChunks
      .map(
        (chunk, index) =>
          `[Source ${index + 1}]
    Chunk Index: ${chunk.chunk_index}
    Similarity: ${chunk.similarity}
    Content:
    ${chunk.content}`
      )
      .join("\n\n");

    // 10. Generate answer
    const result =
      await generateRagAnswer(
        standaloneQuestion,
        context,
        conversationHistory
      );

    // 11. Prepare sources
    const sources = filteredChunks.map(
      (chunk, index) => ({
        sourceNumber: index + 1,
        chunkIndex: chunk.chunk_index,
        similarity: Number(
          chunk.similarity.toFixed(4)
        ),
        relevanceScore: Number(
          chunk.finalScore.toFixed(4)
        ),
        content: chunk.content,
      })
    );

    // 12. Save assistant response
    await saveChatMessage(
      currentSessionId,
      "assistant",
      result.answer,
      sources
    );

    // 13. Return response
    return res.json({
      sessionId: currentSessionId,
      question: question.trim(),
      answer: result.answer,
      sources,
    });
  } catch (error) {
    console.error(
      "Document Q&A error:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      message: "Failed to answer question",
    });
  }
};
const getDocumentChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { sessionId } = req.query;
    const userId = req.user.id;

    let selectedSessionId = sessionId;

    if (!selectedSessionId) {
      const sessionResult = await pool.query(
        `SELECT id
         FROM chat_sessions
         WHERE document_id = $1
         AND user_id = $2
         ORDER BY created_at DESC
         LIMIT 1`,
        [documentId, userId]
      );

      if (sessionResult.rows.length === 0) {
        return res.json({
          sessionId: null,
          messages: [],
        });
      }

      selectedSessionId =
        sessionResult.rows[0].id;
    } else {
      const sessionResult = await pool.query(
        `SELECT id
         FROM chat_sessions
         WHERE id = $1
         AND document_id = $2
         AND user_id = $3`,
        [
          selectedSessionId,
          documentId,
          userId,
        ]
      );

      if (sessionResult.rows.length === 0) {
        return res.status(404).json({
          message: "Chat session not found",
        });
      }
    }

    const messages = await getChatMessages(
      selectedSessionId
    );

    return res.json({
      sessionId: selectedSessionId,
      messages,
    });
  } catch (error) {
    console.error(
      "GET CHAT HISTORY ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to load chat history",
    });
  }
};
const getDocumentChatSessions = async (
  req,
  res
) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const sessions = await getChatSessions(
      userId,
      documentId
    );

    return res.json({
      sessions,
    });
  } catch (error) {
    console.error(
      "GET CHAT SESSIONS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to load chat sessions",
    });
  }
};
const deleteDocumentChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const deletedSession = await deleteChatSession(
      sessionId,
      userId
    );

    if (!deletedSession) {
      return res.status(404).json({
        message: "Chat session not found",
      });
    }

    return res.json({
      message: "Chat session deleted successfully",
      sessionId: deletedSession.id,
    });
  } catch (error) {
    console.error(
      "DELETE CHAT SESSION ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to delete chat session",
    });
  }
};
const updateDocumentChatSession = async (
  req,
  res
) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Chat title is required",
      });
    }

    const updatedSession =
      await updateChatSession(
        sessionId,
        userId,
        title
      );

    if (!updatedSession) {
      return res.status(404).json({
        message: "Chat session not found",
      });
    }

    return res.json({
      message: "Chat session updated successfully",
      session: updatedSession,
    });
  } catch (error) {
    console.error(
      "UPDATE CHAT SESSION ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to update chat session",
    });
  }
};
const askDocumentStream = async (req, res) => {
  const requestStart = Date.now();
  try {
    const { documentId } = req.params;
    const { question, sessionId } = req.body;
    const userId = req.user.id;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    let currentSessionId = sessionId;

    // 1. Create session if needed
    if (!currentSessionId) {
      const title =
        question.trim().slice(0, 50) +
        (question.trim().length > 50
          ? "..."
          : "");

      const session = await createChatSession(
        userId,
        documentId,
        title
      );

      currentSessionId = session.id;
    }

    // 2. Load previous conversation
    const previousMessages =
      await getChatMessages(
        currentSessionId
      );

    const conversationHistory =
      previousMessages
        .slice(-6)
        .map(
          (message) =>
            `${message.role}: ${message.content}`
        )
        .join("\n");

    // 3. Save user question
    await saveChatMessage(
      currentSessionId,
      "user",
      question.trim()
    );

    // 4. Rewrite question only when necessary
    let standaloneQuestion = question.trim();

    const hasConversation =
      conversationHistory.trim().length > 0;

    const followUpPattern =
      /^(it|this|that|they|them|he|she|his|her|their|these|those|which|what about|how about|why|how does it|what does it|and what|also|then|so|another|the other|the secondary|the primary)\b/i;

    const needsRewrite =
      hasConversation &&
      followUpPattern.test(
        standaloneQuestion
      );

    if (needsRewrite) {
      console.log(
        "QUESTION REWRITE STARTED"
      );

      standaloneQuestion =
        await rewriteQuestion(
          standaloneQuestion,
          conversationHistory
        );

      if (
        !standaloneQuestion ||
        typeof standaloneQuestion !== "string"
      ) {
        standaloneQuestion = question.trim();
      }

      console.log(
        "QUESTION REWRITTEN"
      );
    } else {
      console.log(
        "QUESTION REWRITE SKIPPED"
      );
    }

    console.log(
      "STANDALONE QUESTION:",
      standaloneQuestion
    );

    console.log(
      "⏱️ REWRITE TIME:",
      Date.now() - requestStart,
      "ms"
    );

    // 5. Create embedding
    const embeddingResult =
      await createQueryEmbedding(
        standaloneQuestion
      );
    console.log(
      "⏱️ EMBEDDING TIME:",
      Date.now() - requestStart,
      "ms"
    );

    // 6. Search document
    const retrievedChunks =
      await searchDocumentChunks(
        documentId,
        embeddingResult.embedding,
        standaloneQuestion,
        10,
        0.15
      );
    console.log(
      "⏱️ SEARCH TIME:",
      Date.now() - requestStart,
      "ms"
    );
    console.log(
      "RETRIEVED CHUNKS:",
      retrievedChunks.map((chunk) => ({
        index: chunk.chunk_index,
        similarity: Number(
          chunk.similarity.toFixed(4)
        ),
        keywordScore: Number(
          chunk.keywordScore || 0
        ),
        content: chunk.content.slice(0, 150)
      }))
    );


    // 7. Rerank relevant chunks
    const chunks = rerankChunks(
      standaloneQuestion,
      retrievedChunks,
      5
    );
    console.log(
      "⏱️ RERANK TIME:",
      Date.now() - requestStart,
      "ms"
    );
    console.log(
      "RERANKED CHUNKS:",
      chunks.map((chunk) => ({
        index: chunk.chunk_index,
        similarity: Number(
          chunk.similarity.toFixed(4)
        ),
        keywordScore: Number(
          chunk.keywordScore.toFixed(4)
        ),
        finalScore: Number(
          chunk.finalScore.toFixed(4)
        ),
      }))
    );

    const filteredChunks = chunks
      .filter(
        (chunk) =>
          Number(chunk.similarity) >= 0.15
      )
      .slice(0, 3);

    // 8. No relevant information
    if (filteredChunks.length === 0) {
      return res.json({
        sessionId: currentSessionId,
        question: question.trim(),
        answer:
          "I couldn't find the answer in the document.",
        sources: [],
      });
    }

    // 9. Build context
    const context = filteredChunks
      .map(
        (chunk, index) =>
          `[Source ${index + 1}]
    Chunk Index: ${chunk.chunk_index}
    Similarity: ${chunk.similarity}
    Content:
    ${chunk.content}`
      )
      .join("\n\n");

    // 10. Prepare sources
    const sources = filteredChunks.map(
      (chunk, index) => ({
        sourceNumber: index + 1,
        chunkIndex: chunk.chunk_index,
        similarity: Number(
          chunk.similarity.toFixed(4)
        ),
         content: chunk.content ,
      })
    );

    // 10. Tell frontend that stream is starting
    res.setHeader(
      "Content-Type",
      "text/event-stream"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache"
    );

    res.setHeader(
      "Connection",
      "keep-alive"
    );

    res.flushHeaders();

    // Send session information first
    res.write(
      `data: ${JSON.stringify({
        type: "start",
        sessionId: currentSessionId,
        sources,
      })}\n\n`
    );
    console.log("STARTING AI STREAM");
    console.log("QUESTION:", standaloneQuestion);
    console.log("CONTEXT LENGTH:", context.length);
    // 11. Start AI stream
    const stream =
      await generateRagAnswerStream(
        standaloneQuestion,
        context,
        conversationHistory
      );
    console.log(
      "⏱️ LLM ANSWER TIME:",
      Date.now() - requestStart,
      "ms"
    );
    console.log(
      "AI STREAM CONNECTED"
    );

    

    // 12. Receive AI chunks
    let fullAnswer = "";

    let buffer = "";
    let firstTokenTime = null;
    stream.on("data", (chunk) => {
      buffer += chunk.toString();

      const events = buffer.split(/\r?\n\r?\n/);

      buffer = events.pop() || "";

      for (const event of events) {
        const dataLine = event
          .split(/\r?\n/)
          .find((line) => line.startsWith("data:"));

        if (!dataLine) {
          continue;
        }

        const jsonText = dataLine
          .replace(/^data:\s*/, "")
          .trim();

        if (!jsonText) {
          continue;
        }

        try {
          const data = JSON.parse(jsonText);

          if (data.token !== undefined) {
            if (firstTokenTime === null) {
              firstTokenTime = Date.now() - requestStart;
              console.log(
                "⏱️ FIRST TOKEN TIME:",
                firstTokenTime,
                "ms"
              );
            }
            fullAnswer += data.token;

            res.write(
              `data: ${JSON.stringify({
                type: "chunk",
                content: data.token,
              })}\n\n`
            );
          }

          if (data.done === true) {
            console.log("AI TOKEN STREAM DONE");
          }
        } catch (error) {
          console.error(
            "STREAM TOKEN PARSE ERROR:",
            jsonText
          );
        }
      }
    });
    

    // 13. Stream completed
    stream.on("end", async () => {
      try {
        console.log("⏱️ TOTAL STREAM REQUEST TIME:", Date.now() - requestStart, "ms");
        console.log(
          "FULL STREAM ANSWER:",
          fullAnswer
        );

        if (!fullAnswer.trim()) {
          console.error(
            "AI returned an empty answer"
          );

          if (!res.writableEnded) {
            res.write(
              `data: ${JSON.stringify({
                type: "error",
                message:
                  "AI returned an empty answer.",
              })}\n\n`
            );

            res.end();
          }

          return;
        }

        await saveChatMessage(
          currentSessionId,
          "assistant",
          fullAnswer,
          sources
        );

        res.write(
          `data: ${JSON.stringify({
            type: "done",
          })}\n\n`
        );

        res.end();
      } catch (error) {
        console.error(
          "SAVE STREAM ERROR:",
          error
        );

        if (!res.writableEnded) {
          res.end();
        }
      }
    });

    stream.on("error", (error) => {
      console.error(
        "AI STREAM ERROR:",
        error
      );

      if (!res.writableEnded) {
        res.write(
          `data: ${JSON.stringify({
            type: "error",
            message:
              "AI streaming failed",
          })}\n\n`
        );

        res.end();
      }
    });

  } catch (error) {
    console.error(
      "STREAM Q&A ERROR:",
      error.response?.data ||
        error.message
    );

    if (!res.headersSent) {
      return res.status(500).json({
        message:
          "Failed to stream answer",
      });
    }

    res.end();
  }
};



module.exports = {
  askDocument,
  getDocumentChatHistory,
  askDocumentStream ,
  getDocumentChatSessions,
  deleteDocumentChatSession,
  updateDocumentChatSession,
};