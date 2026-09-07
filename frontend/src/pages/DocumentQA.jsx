import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  askDocument,
  getChatHistory,
  askDocumentStream,
  getChatSessions,
  deleteChatSession,
  updateChatSession,
} from "../services/ragService";
import DocumentSummary from "../components/DocumentSummary";
import DocumentQuestions from "../components/DocumentQuestions";
import SourceList from "../components/SourceList";

function DocumentQA() {
  const { documentId } = useParams();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSource, setActiveSource] = useState(null);

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

  // Load existing chat history when document changes
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const data = await getChatHistory(documentId);

        setSessionId(data.sessionId);

        const history = [];

        for (let i = 0; i < data.messages.length; i += 2) {
          const userMessage = data.messages[i];
          const assistantMessage = data.messages[i + 1];

          if (
            userMessage?.role === "user" &&
            assistantMessage?.role === "assistant"
          ) {
            history.push({
              question: userMessage.content,
              answer: assistantMessage.content,
              sources: assistantMessage.sources || [],
              createdAt: assistantMessage.created_at,
            });
          }
        }

        setMessages(history);
      } catch (err) {
        console.error("LOAD CHAT HISTORY ERROR:", err);
      }
    };

    if (documentId) {
      loadChatHistory();
    }
  }, [documentId]);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await getChatSessions(documentId);
        setSessions(data.sessions || []);
      } catch (error) {
        console.error("LOAD CHAT SESSIONS ERROR:", error);
      }
    };

    loadSessions();
  }, [documentId]);

  const handleAsk = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    const currentQuestion = question.trim();

    try {
      setLoading(true);
      setError("");
      setQuestion("");

      let assistantAnswer = "";
      let sources = [];

      const temporaryMessage = {
        question: currentQuestion,
        answer: "",
        sources: [],
      };

      setMessages((prev) => [...prev, temporaryMessage]);

      await askDocumentStream(
        documentId,
        currentQuestion,
        sessionId,
        (event) => {
          if (event.type === "start") {
            setSessionId(event.sessionId);
            loadSessions();
            sources = event.sources || [];

            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                sources,
              };
              return updated;
            });
          }

          if (event.type === "chunk") {
            console.log("CHUNK RECEIVED:", event.content);
            assistantAnswer += event.content;

            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                answer: assistantAnswer,
              };
              return updated;
            });
          }

          if (event.type === "done") {
            console.log("STREAM COMPLETED");
          }

          if (event.type === "error") {
            setError(event.message || "AI streaming failed");
          }
        }
      );
    } catch (err) {
      console.error("STREAM ASK ERROR:", err);
      setError(err.message || "Failed to get an answer.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setQuestion("");
    setMessages([]);
    setSessionId(null);
    setError("");
  };

  const handleClear = () => {
    setQuestion("");
    setMessages([]);
    setError("");
  };

  const renderAnswer = (answer) => {
    if (!answer) return null;

    const parts = answer.split(/(\[Source\s+\d+\])/g);

    return parts.map((part, index) => {
      const match = part.match(/^\[Source\s+(\d+)\]$/);

      if (!match) {
        return <span key={index}>{part}</span>;
      }

      const sourceNumber = Number(match[1]);

      return (
        <button
          key={index}
          type="button"
          onClick={() => setActiveSource(sourceNumber)}
          className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
        >
          {part}
        </button>
      );
    });
  };

  const loadSessions = async () => {
    try {
      const data = await getChatSessions(documentId);
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("LOAD CHAT SESSIONS ERROR:", error);
    }
  };

  const handleSelectSession = async (selectedSessionId) => {
    try {
      setLoading(true);
      setError("");

      const data = await getChatHistory(documentId, selectedSessionId);
      setSessionId(data.sessionId);

      const history = [];
      let userMessage = null;

      data.messages.forEach((message) => {
        if (message.role === "user") {
          userMessage = message;
        }

        if (message.role === "assistant" && userMessage) {
          history.push({
            question: userMessage.content,
            answer: message.content,
            sources: message.sources || [],
            createdAt: userMessage.created_at,
            answerCreatedAt: message.created_at,
          });
          userMessage = null;
        }
      });

      setMessages(history);
    } catch (error) {
      console.error("LOAD SELECTED SESSION ERROR:", error);
      setError("Failed to load chat session.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (selectedSessionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this chat?"
    );
    if (!confirmed) return;

    try {
      setError("");
      await deleteChatSession(documentId, selectedSessionId);

      const remainingSessions = sessions.filter(
        (session) => session.id !== selectedSessionId
      );
      setSessions(remainingSessions);

      if (selectedSessionId === sessionId) {
        if (remainingSessions.length > 0) {
          await handleSelectSession(remainingSessions[0].id);
        } else {
          setSessionId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("DELETE CHAT SESSION ERROR:", error);
      setError("Failed to delete chat session.");
    }
  };

  const handleRenameSession = async (selectedSessionId, currentTitle) => {
    const newTitle = window.prompt(
      "Enter a new chat title:",
      currentTitle || "New Chat"
    );

    if (newTitle === null) return;

    if (!newTitle.trim()) {
      setError("Chat title cannot be empty.");
      return;
    }

    try {
      setError("");
      const data = await updateChatSession(
        documentId,
        selectedSessionId,
        newTitle.trim()
      );

      setSessions((prev) =>
        prev.map((session) =>
          session.id === selectedSessionId
            ? { ...session, title: data.session.title }
            : session
        )
      );
    } catch (error) {
      console.error("RENAME CHAT SESSION ERROR:", error);
      setError("Failed to rename chat session.");
    }
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
      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ask Your Document
              </h1>
              <p className="mt-2 text-base text-zinc-400">
                Get accurate answers grounded in the content of your uploaded
                document.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                handleNewChat();
                setMessages([]);
                setSessionId(null);
                setQuestion("");
                setError("");
              }}
              className="shrink-0 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
            >
              + New Chat
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <DocumentSummary documentId={documentId} />
            <DocumentQuestions documentId={documentId} />
          </div>
        </header>

        {/* Previous Chat Sessions */}
        {sessions.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <h3 className="mb-4 text-sm font-semibold text-zinc-300">
              Recent Chats
            </h3>

            <div className="space-y-2">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center gap-2 rounded-xl p-2 transition ${
                    session.id === sessionId
                      ? "bg-indigo-500/15 ring-1 ring-indigo-500/30"
                      : "hover:bg-white/5"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectSession(session.id)}
                    className="min-w-0 flex-1 rounded-lg p-2 text-left"
                  >
                    <p
                      className={`truncate text-sm font-medium ${
                        session.id === sessionId
                          ? "text-indigo-300"
                          : "text-zinc-200"
                      }`}
                    >
                      {session.title || "New Chat"}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {session.created_at
                        ? new Date(session.created_at).toLocaleString()
                        : ""}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleRenameSession(session.id, session.title)
                    }
                    className="rounded-lg px-2.5 py-1.5 text-sm text-zinc-400 transition hover:bg-white/10 hover:text-indigo-300"
                    title="Rename chat"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSession(session.id)}
                    className="rounded-lg px-2.5 py-1.5 text-sm text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
                    title="Delete chat"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <form onSubmit={handleAsk} className="space-y-5">
            <div>
              <label
                htmlFor="question"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Your question
              </label>

              <textarea
                id="question"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (error) setError("");
                }}
                placeholder="What would you like to know about this document?"
                rows={4}
                disabled={loading}
                className="block w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder-zinc-500 shadow-inner transition focus:border-indigo-400/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {error && (
                <p className="mt-2 text-sm font-medium text-red-400">{error}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading || !question.trim()}
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
                    Thinking...
                  </>
                ) : (
                  "Ask AI"
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
            <p className="text-sm text-zinc-400">
              Searching your document and generating an answer…
            </p>
          </div>
        )}

        {/* Current Conversation */}
        {messages.length > 0 && (
          <div className="mt-8 space-y-8">
            {messages.map((message, index) => (
              <div key={index} className="space-y-4">
                {/* User Question */}
                <div className="flex justify-end">
                  <div className="max-w-2xl rounded-2xl rounded-br-md bg-indigo-600 px-5 py-3.5 text-white shadow-lg shadow-indigo-500/20">
                    <p className="text-sm leading-relaxed">{message.question}</p>
                    <p className="mt-1.5 text-right text-xs text-indigo-200/80">
                      {message.createdAt
                        ? new Date(message.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>
                </div>

                {/* AI Answer */}
                <div className="flex justify-start">
                  <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl backdrop-blur-xl">
                    <div className="border-b border-white/10 bg-white/[0.03] px-6 py-3">
                      <h3 className="text-sm font-semibold text-zinc-200">
                        AI Answer
                      </h3>
                    </div>

                    <div className="px-6 py-5">
                      {!message.answer && loading && (
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                          <span>AI is thinking...</span>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                        {renderAnswer(message.answer)}
                      </div>

                      <SourceList
                        sources={message.sources}
                        activeSource={activeSource}
                        onSourceClick={setActiveSource}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && messages.length === 0 && !error && (
          <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 ring-1 ring-indigo-500/25">
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
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">
              Ask something about your document
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Your conversation will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentQA;