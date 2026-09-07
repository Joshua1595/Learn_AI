import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
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

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#07070c]"
    >
      {/* ========== Interactive Background ========== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/15 blur-[120px] transition-all duration-300 ease-out"
          style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }}
        />
        <div
          className="absolute h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[90px] transition-all duration-500 ease-out"
          style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }}
        />
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

        {/* Subtle stars */}
        {[...Array(30)].map((_, i) => {
          const baseX = (i * 19) % 100;
          const baseY = (i * 29) % 100;
          const size = (i % 3) + 1;
          const offsetX = (pointer.x - 50) * 0.03;
          const offsetY = (pointer.y - 50) * 0.03;

          return (
            <div
              key={i}
              className="absolute rounded-full bg-white transition-transform duration-700 ease-out"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `calc(${baseX}% + ${offsetX}px)`,
                top: `calc(${baseY}% + ${offsetY}px)`,
                opacity: 0.2 + (i % 4) * 0.1,
                animation: `twinkle ${5 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${(i % 6) * 0.5}s`,
              }}
            />
          );
        })}
      </div>

      {/* ========== Main Content ========== */}
      {/* Added proper top padding so content is not covered by the floating navbar */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome to LearnAI
          </h1>
          <p className="mt-3 max-w-2xl text-base text-zinc-400">
            Upload your learning documents and use AI to understand them better.
          </p>
        </header>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Documents Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-7 shadow-xl shadow-black/20 backdrop-blur-xl transition hover:border-indigo-500/30 hover:shadow-indigo-500/10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/20">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white">
                  My Documents
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Upload and manage your learning documents.
                </p>
              </div>
            </div>

            <Link
              to="/documents"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#07070c]"
            >
              View Documents
              <svg
                className="h-4 w-4 transition group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          {/* AI Tutor Card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-7 shadow-xl shadow-black/20 backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/20">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white">AI Tutor</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  AI features will appear here after we complete document
                  processing.
                </p>
              </div>
            </div>

            <button
              disabled
              className="mt-7 inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-500 ring-1 ring-white/10"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;