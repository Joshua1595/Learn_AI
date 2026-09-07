import { useState } from "react";
import { explainDocumentTopic } from "../services/explanationService";

function DocumentExplanation({ documentId }) {
  const [topic, setTopic] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExplain = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setExplanation("");

      const data = await explainDocumentTopic(documentId, topic.trim());
      setExplanation(data.explanation || "");
    } catch (err) {
      console.error("EXPLANATION ERROR:", err);
      setError(
        err.response?.data?.message || "Failed to explain topic."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTopic("");
    setExplanation("");
    setError("");
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/[0.03] px-6 py-5">
        <h2 className="text-lg font-semibold text-white">
          Explain a Topic
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Ask AI to explain any topic using this document as the source.
        </p>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleExplain} className="space-y-4">
          <div>
            <label
              htmlFor="topic"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Topic to explain
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. machine learning, neural networks, gradient descent"
                disabled={loading}
                className="block w-full flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-500 shadow-inner transition focus:border-indigo-400/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#07070c] disabled:cursor-not-allowed disabled:opacity-60"
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
                      Explaining...
                    </>
                  ) : (
                    "Explain"
                  )}
                </button>

                {(topic || explanation) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={loading}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 disabled:opacity-60"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3.5">
            <p className="text-sm font-medium text-red-300">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
            <p className="text-sm text-zinc-400">
              Reading the document and generating an explanation…
            </p>
          </div>
        )}

        {/* Explanation Result */}
        {!loading && explanation && (
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
            <div className="border-b border-white/10 bg-indigo-500/10 px-5 py-3.5">
              <h3 className="text-sm font-semibold text-indigo-300">
                AI Explanation
              </h3>
              {topic && (
                <p className="mt-0.5 text-xs text-indigo-400/80">
                  Topic: {topic}
                </p>
              )}
            </div>

            <div className="px-5 py-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {explanation}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !explanation && !error && (
          <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-5 py-8 text-center">
            <p className="text-sm text-zinc-500">
              Enter a topic above and click{" "}
              <span className="font-medium text-zinc-300">Explain</span> to get
              a clear explanation based on this document.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentExplanation;