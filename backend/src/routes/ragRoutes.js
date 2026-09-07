const express = require("express");

const {
  askDocument,
  getDocumentChatHistory,
  askDocumentStream ,
  getDocumentChatSessions,
  deleteDocumentChatSession,
  updateDocumentChatSession,
} = require("../controllers/ragController");

const protect =
  require("../middleware/authMiddleware");
const {
  summarizeDocument,
  getDocumentSummary,
} = require("../controllers/summaryController");
const {
  generateDocumentQuestions,
} = require("../controllers/questionController");
const {
  explainDocumentTopic,
  testRetrieval,
} = require("../controllers/explanationController");


const router = express.Router();

router.post(
  "/documents/:documentId/ask",
  protect,
  askDocument
);
router.get(
  "/documents/:documentId/chat",
  protect,
  getDocumentChatHistory
);
router.get(
  "/documents/:documentId/chat/sessions",
  protect,
  getDocumentChatSessions
);
router.delete(
  "/documents/:documentId/chat/sessions/:sessionId",
  protect,
  deleteDocumentChatSession
);
router.put(
  "/documents/:documentId/chat/sessions/:sessionId",
  protect,
  updateDocumentChatSession
);
router.post(
  "/documents/:documentId/summarize",
  protect,
  summarizeDocument
);
router.get(
  "/documents/:documentId/summary",
  protect,
  getDocumentSummary
);
router.post(
  "/documents/:documentId/questions",
  protect,
  generateDocumentQuestions
);
router.post(
  "/documents/:documentId/explain",
  protect,
  explainDocumentTopic
);
router.post(
  "/documents/:documentId/test-retrieval",
  protect,
  testRetrieval
);
router.post(
  "/documents/:documentId/ask-stream",
  protect ,
  askDocumentStream
);
module.exports = router;