const pool = require("../config/db");

const saveQuizAttempt = async (req, res) => {
  try {
    const { documentId } = req.params;

    const {
      totalQuestions,
      correctAnswers,
    } = req.body;

    if (
      !totalQuestions ||
      correctAnswers === undefined
    ) {
      return res.status(400).json({
        message: "Quiz result is required",
      });
    }

    const scorePercentage =
      (correctAnswers / totalQuestions) * 100;

    const result = await pool.query(
      `INSERT INTO quiz_attempts
       (
         document_id,
         user_id,
         total_questions,
         correct_answers,
         score_percentage
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        documentId,
        req.user.id,
        totalQuestions,
        correctAnswers,
        scorePercentage,
      ]
    );

    return res.status(201).json({
      message: "Quiz result saved successfully",
      attempt: result.rows[0],
    });
  } catch (error) {
    console.error(
      "SAVE QUIZ ATTEMPT ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to save quiz result",
    });
  }
};
const getQuizAttempts = async (req, res) => {
  try {
    const { documentId } = req.params;

    const result = await pool.query(
      `SELECT
         id,
         total_questions,
         correct_answers,
         score_percentage,
         created_at
       FROM quiz_attempts
       WHERE document_id = $1
       AND user_id = $2
       ORDER BY created_at DESC`,
      [documentId, req.user.id]
    );

    return res.json({
      attempts: result.rows,
    });
  } catch (error) {
    console.error(
      "GET QUIZ ATTEMPTS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to load quiz history",
    });
  }
};
const deleteQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const result = await pool.query(
      `DELETE FROM quiz_attempts
       WHERE id = $1
       AND user_id = $2
       RETURNING id`,
      [
        attemptId,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Quiz attempt not found",
      });
    }

    return res.json({
      message: "Quiz attempt deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE QUIZ ATTEMPT ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to delete quiz attempt",
    });
  }
};

module.exports = {
  saveQuizAttempt,
  getQuizAttempts,
  deleteQuizAttempt,
};