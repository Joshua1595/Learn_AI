const axios = require("axios");

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  "http://localhost:8000";
const rewriteQuestion = async (
  question,
  conversationHistory = ""
) => {
  const currentQuestion = question.trim();

  if (!conversationHistory.trim()) {
    return currentQuestion;
  }

  const messages = conversationHistory
    .split("\n")
    .filter((line) => line.trim());

  const userMessages = messages
    .filter((line) =>
      line.toLowerCase().startsWith("user:")
    )
    .map((line) =>
      line.replace(/^user:\s*/i, "").trim()
    );

  if (userMessages.length === 0) {
    return currentQuestion;
  }

  const previousQuestion =
    userMessages[userMessages.length - 1];

  const followUpPattern =
    /^(what about|how about|and what|what is its|what was its|what are its|how does it|how is it|why is it|why was it|why does it|how did it|what does it|what did it|can you explain it|explain it|tell me more about it|and why|and how|also|then|so)\b/i;

  const referencePattern =
    /\b(it|its|this|that|they|them|these|those|he|she|his|her|their)\b/i;

  const isFollowUp =
    followUpPattern.test(currentQuestion) ||
    referencePattern.test(currentQuestion);

  if (!isFollowUp) {
    return currentQuestion;
  }

  let resolvedQuestion = currentQuestion;

  // "What about X?" → connect X to previous question
  if (/^what about\b/i.test(currentQuestion)) {
    let topic = currentQuestion
      .replace(/^what about\s*/i, "")
      .replace(/[?]+$/, "")
      .trim();

    topic = topic.replace(/^the\s+/i, "");

    resolvedQuestion =
      `What is the ${topic} of the study?`;
  }

  // "How about X?"
  else if (/^how about\b/i.test(currentQuestion)) {
    const topic = currentQuestion
      .replace(/^how about\s*/i, "")
      .replace(/[?]+$/, "")
      .trim();

    resolvedQuestion =
      `How does the ${topic} relate to the previous question: ${previousQuestion}?`;
  }

  // "What is its X?" / "What was its X?"
  else if (
    /\b(its|it)\b/i.test(currentQuestion)
  ) {
    resolvedQuestion =
      `${currentQuestion} Context: The previous question was: ${previousQuestion}`;
  }

  // Other follow-up questions
  else {
    resolvedQuestion =
      `${currentQuestion} Context: The previous question was: ${previousQuestion}`;
  }

  console.log("FAST FOLLOW-UP RESOLUTION");
  console.log("PREVIOUS QUESTION:", previousQuestion);
  console.log("CURRENT QUESTION:", currentQuestion);
  console.log("RESOLVED QUESTION:", resolvedQuestion);

  return resolvedQuestion;
};

const generateRagAnswer = async (
  question,
  context,
  conversationHistory = ""
) => {
  const response = await axios.post(
    `${process.env.AI_SERVICE_URL}/generate-rag-answer`,
    {
      question,
      context,
      conversationHistory,
    }
  );

  return {
    answer: response.data.answer,
  };
};
const generateRagAnswerStream = async (
  question,
  context,
  conversationHistory = ""
) => {
  const response = await axios.post(
    `${AI_SERVICE_URL}/generate-rag-answer-stream`,
    {
      question,
      context,
      conversationHistory,
    },
    {
      responseType: "stream",
    }
  );

  return response.data;
};

module.exports = {
  generateRagAnswer,
  rewriteQuestion,
  generateRagAnswerStream ,
};