const express = require("express");
const router = express.Router();

const {
  saveQuizAttempt,
  getQuizAttempts,
  deleteQuizAttempt,
} = require("../controllers/quizController");

const protect = require("../middleware/authMiddleware");

router.post(
  "/documents/:documentId/quiz-attempts",
  protect,
  saveQuizAttempt
);
router.get(
  "/documents/:documentId/quiz-attempts",
  protect,
  getQuizAttempts
);
router.delete(
  "/quiz-attempts/:attemptId",
  protect,
  deleteQuizAttempt
);

module.exports = router;