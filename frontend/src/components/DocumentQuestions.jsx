import { useEffect, useState } from "react";
import { generateDocumentQuestions } from "../services/questionService";
import {
  saveQuizAttempt,
  getQuizAttempts,
  deleteQuizAttempt,
} from "../services/quizService";

function DocumentQuestions({ documentId }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState([]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");
      setSubmitted(false);
      setAnswers({});
      setScore(0);

      const data = await generateDocumentQuestions(documentId);
      console.log("FULL QUESTIONS:", JSON.stringify(data.questions, null, 2));

      setQuestions(data.questions);
    } catch (error) {
      console.error("QUESTION GENERATION ERROR:", error);
      setError(
        error.response?.data?.message || "Failed to generate questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers((previous) => ({
      ...previous,
      [questionIndex]: answer,
    }));
  };

  const handleSubmit = async () => {
    let totalCorrect = 0;

    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        totalCorrect++;
      }
    });

    setScore(totalCorrect);
    setSubmitted(true);

    try {
      await saveQuizAttempt(documentId, questions.length, totalCorrect);
      const data = await getQuizAttempts(documentId);
      setAttempts(data.attempts);
      console.log("Quiz attempt saved successfully");
    } catch (error) {
      console.error("SAVE QUIZ RESULT ERROR:", error);
    }
  };

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        const data = await getQuizAttempts(documentId);
        setAttempts(data.attempts);
      } catch (error) {
        console.error("LOAD QUIZ HISTORY ERROR:", error);
      }
    };

    if (documentId) {
      loadAttempts();
    }
  }, [documentId]);

  const handleDeleteAttempt = async (attemptId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz attempt?"
    );

    if (!confirmed) return;

    try {
      await deleteQuizAttempt(attemptId);

      setAttempts((previous) =>
        previous.filter((attempt) => attempt.id !== attemptId)
      );
    } catch (error) {
      console.error("DELETE QUIZ ATTEMPT ERROR:", error);
      setError(
        error.response?.data?.message || "Failed to delete quiz attempt"
      );
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Practice Questions
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Test your knowledge from this document.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#07070c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </>
          ) : (
            "Generate Questions"
          )}
        </button>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3.5">
            <p className="text-sm font-medium text-red-300">{error}</p>
          </div>
        )}

        {questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((item, index) => {
              const selectedAnswer = answers[index];
              const isCorrect =
                submitted && selectedAnswer === item.correctAnswer;

              return (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <h3 className="font-semibold text-white">
                    {index + 1}. {item.question}
                  </h3>

                  <div className="mt-4 space-y-3">
                    {item.options.map((option, optionIndex) => {
                      const selected = selectedAnswer === option;
                      const correct =
                        submitted && option === item.correctAnswer;

                      return (
                        <label
                          key={`${index}-${optionIndex}`}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                            correct
                              ? "border-emerald-500/40 bg-emerald-500/10"
                              : selected && submitted
                              ? "border-red-500/40 bg-red-500/10"
                              : selected
                              ? "border-indigo-500/40 bg-indigo-500/10"
                              : "border-white/10 hover:bg-white/[0.04]"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={selected}
                            disabled={submitted}
                            onChange={() => handleAnswerChange(index, option)}
                            className="mt-1 accent-indigo-500"
                          />

                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-zinc-300">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>

                          <span className="pt-1 text-sm text-zinc-300">
                            {option}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div className="mt-4">
                      {isCorrect ? (
                        <p className="text-sm font-semibold text-emerald-400">
                          ✓ Correct
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-red-400">
                          ✗ Incorrect
                          <span className="ml-1 font-normal text-zinc-400">
                            Correct answer: {item.correctAnswer}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {!submitted && (
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500"
              >
                Submit Quiz
              </button>
            )}

            {submitted && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
                <h3 className="text-lg font-semibold text-zinc-300">
                  Your Score
                </h3>
                <p className="mt-3 text-4xl font-bold text-indigo-400">
                  {score} / {questions.length}
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  {Math.round((score / questions.length) * 100)}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state when no questions yet */}
        {questions.length === 0 && !loading && !error && (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-5 py-10 text-center">
            <p className="text-sm text-zinc-500">
              Click{" "}
              <span className="font-medium text-zinc-300">
                Generate Questions
              </span>{" "}
              to create a practice quiz from this document.
            </p>
          </div>
        )}

        {/* Quiz History */}
        {attempts.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Quiz History
            </h2>

            <div className="space-y-3">
              {attempts.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">
                      Attempt {attempts.length - index}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      {new Date(attempt.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-indigo-400">
                        {attempt.correct_answers} / {attempt.total_questions}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {Number(attempt.score_percentage).toFixed(0)}%
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAttempt(attempt.id)}
                      className="rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentQuestions;