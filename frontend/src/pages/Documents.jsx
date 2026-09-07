import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
} from "../services/documentService";
import DocumentExplanation from "../components/DocumentExplanation";

function Documents() {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Interactive background
  const containerRef = useRef(null);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      setPointer({ x, y });
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await getMyDocuments();
      setDocuments(data?.documents || []);
    } catch {
      setError("Failed to load documents");
      setDocuments([]);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a document");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await uploadDocument(file);

      setFile(null);
      e.target.reset();
      await loadDocuments();
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await deleteDocument(documentId);
      await loadDocuments();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete document"
      );
    }
  };

  const getStatusStyles = (status) => {
    if (status === "processed")
      return "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25";
    if (status === "failed")
      return "bg-red-500/15 text-red-400 ring-1 ring-red-500/25";
    return "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25";
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#07070c]"
    >
      {/* Interactive Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/12 blur-[120px] transition-all duration-300 ease-out"
          style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }}
        />
        <div
          className="absolute h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[90px] transition-all duration-500 ease-out"
          style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }}
        />
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      {/* Main Content - Added proper top padding for the floating navbar */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            My Documents
          </h1>
          <p className="mt-3 text-base text-zinc-400">
            Upload documents that you want to study with LearnAI.
          </p>
        </header>

        {/* Upload Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label
                htmlFor="document"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Select document
              </label>
              <input
                id="document"
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-300 hover:file:bg-indigo-500/30 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Supported formats: PDF, TXT, DOCX
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3.5">
                <p className="text-sm font-medium text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#07070c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
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
                  Uploading...
                </>
              ) : (
                "Upload Document"
              )}
            </button>
          </form>
        </div>

        {/* Documents List */}
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Uploaded Documents
          </h2>

          {documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center backdrop-blur-xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 ring-1 ring-indigo-500/25">
                <svg
                  className="h-7 w-7 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-zinc-500">
                No documents uploaded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-xl backdrop-blur-xl"
                >
                  {/* Document Header */}
                  <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-semibold text-white">
                        {document.filename}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500">
                        {document.file_type}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3.5 py-1 text-xs font-medium capitalize ${getStatusStyles(
                          document.status
                        )}`}
                      >
                        {document.status}
                      </span>

                      <button
                        onClick={() =>
                          navigate(`/documents/${document.id}/ask`)
                        }
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
                      >
                        Ask AI
                      </button>
                      <button
                        onClick={() => handleDelete(document.id)}
                        className="rounded-xl bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-400 ring-1 ring-red-500/25 transition hover:bg-red-500/25"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Extracted Text Preview */}
                  {document.extracted_text && (
                    <div className="border-b border-white/10 px-5 py-4 sm:px-6">
                      <p className="mb-2 text-sm font-medium text-zinc-400">
                        Extracted text preview
                      </p>
                      <p className="text-sm leading-relaxed text-zinc-400">
                        {document.extracted_text.substring(0, 500)}
                        {document.extracted_text.length > 500 && "..."}
                      </p>
                    </div>
                  )}

                  {/* Document Explanation */}
                  <div className="p-5 sm:p-6">
                    <DocumentExplanation documentId={document.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Documents;