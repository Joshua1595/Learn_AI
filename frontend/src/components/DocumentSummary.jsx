import { useEffect, useState } from "react";
import {
  summarizeDocument,
  getDocumentSummary,
} from "../services/summaryService";

function DocumentSummary({ documentId }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoadingSaved(true);

        const data = await getDocumentSummary(documentId);

        if (data.summary) {
          setSummary(data.summary);
        }
      } catch (error) {
        console.error("LOAD SUMMARY ERROR:", error);
      } finally {
        setLoadingSaved(false);
      }
    };

    if (documentId) {
      loadSummary();
    }
  }, [documentId]);

  const handleSummarize = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await summarizeDocument(documentId);
      setSummary(data.summary);
    } catch (error) {
      console.error("SUMMARY ERROR:", error);

      setError(
        error.response?.data?.message || "Failed to summarize document"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingSaved) {
    return (
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
          <p className="text-sm text-zinc-400">Loading summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Document Summary
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Generate an AI summary of this document.
          </p>
        </div>

        {!summary && (
          <button
            type="button"
            onClick={handleSummarize}
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
                Summarizing...
              </>
            ) : (
              "Summarize"
            )}
          </button>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3.5">
            <p className="text-sm font-medium text-red-300">{error}</p>
          </div>
        )}

        {summary && (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
            <div className="border-b border-white/10 bg-indigo-500/10 px-5 py-3.5">
              <h3 className="text-sm font-semibold text-indigo-300">
                AI Summary
              </h3>
            </div>
            <div className="px-5 py-5">
              <p className="whitespace-pre-line text-sm leading-7 text-zinc-300">
                {summary}
              </p>
            </div>
          </div>
        )}

        {!summary && !loading && !error && (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-5 py-8 text-center">
            <p className="text-sm text-zinc-500">
              Click{" "}
              <span className="font-medium text-zinc-300">Summarize</span> to
              generate an AI summary of this document.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentSummary;