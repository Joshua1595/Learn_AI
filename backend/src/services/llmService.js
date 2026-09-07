const axios = require("axios");

const generateText = async (
  question,
  context
) => {
  const response = await fetch(
    "http://localhost:8000/generate-answer",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        context,
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `AI service error: ${errorText}`
    );
  }

  return response.json();
};

const generateSummary = async (text) => {
  const question = `
Summarize this document.

Rules:
- Use only information from the document.
- Do not invent information.
- Identify the main ideas.
- Keep the summary clear and concise.
`;

  const result = await generateText(
    question,
    text
  );

  return result.answer;
};

const generateQuestions = async (
  text,
  count = 5
) => {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      300000
    );

  let response;

  try {
    response = await fetch(
      "http://localhost:8000/generate-questions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context: text,
          count,
        }),
        signal: controller.signal,
      }
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `AI question service error: ${errorText}`
    );
  }

  const data =
    await response.json();

  let questions;

  try {
    questions =
      typeof data.questions === "string"
        ? JSON.parse(data.questions)
        : data.questions;
  } catch (error) {
    console.error(
      "QUESTION JSON PARSE ERROR:",
      data.questions
    );

    throw new Error(
      "AI returned invalid question format"
    );
  }

  if (!Array.isArray(questions)) {
    throw new Error(
      "AI did not return a question array"
    );
  }

  if (questions.length !== count) {
    throw new Error(
      `AI generated ${questions.length} questions instead of ${count}`
    );
  }

  questions.forEach(
    (question, index) => {
      if (
        !question.question ||
        typeof question.question !== "string"
      ) {
        throw new Error(
          `Question ${index + 1} is missing question text`
        );
      }

      if (
        !Array.isArray(question.options) ||
        question.options.length !== 4
      ) {
        throw new Error(
          `Question ${index + 1} must have exactly 4 options`
        );
      }

      if (
        !question.options.every(
          (option) =>
            typeof option === "string" &&
            option.trim().length > 0
        )
      ) {
        throw new Error(
          `Question ${index + 1} contains an invalid option`
        );
      }

      if (
        !question.correctAnswer ||
        typeof question.correctAnswer !== "string"
      ) {
        throw new Error(
          `Question ${index + 1} is missing the correct answer`
        );
      }

      if (
        !question.options.includes(
          question.correctAnswer
        )
      ) {
        throw new Error(
          `Question ${index + 1} has a correct answer that is not one of the options`
        );
      }
    }
  );

  return questions;
};

const generateRagAnswerStream = async (
  question,
  context,
  conversationHistory = ""
) => {
  const response = await axios.post(
    `${process.env.AI_SERVICE_URL}/generate-rag-answer-stream`,
    {
      question,
      context,
      conversationHistory:
        conversationHistory,
    },
    {
      responseType: "stream",
    }
  );

  return response.data;
};

module.exports = {
  generateText,
  generateSummary,
  generateQuestions,
  generateRagAnswerStream,
};