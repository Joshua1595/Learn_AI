import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function Landing() {
  const containerRef = useRef(null);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [wordIndex, setWordIndex] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  const rotatingWords = [
    "documents",
    "notes",
    "textbooks",
    "research",
    "lectures",
    "knowledge",
  ];

  const features = [
    {
      title: "Document Q&A",
      desc: "Ask questions directly from your study materials and get intelligent, source-grounded answers.",
      icon: "⌕",
      number: "01",
    },
    {
      title: "Smart Summaries",
      desc: "Turn long and complicated documents into clear, concise summaries in seconds.",
      icon: "✦",
      number: "02",
    },
    {
      title: "AI Explanations",
      desc: "Confused about a topic? Let LearnAI break difficult concepts down into simple ideas.",
      icon: "◉",
      number: "03",
    },
    {
      title: "Practice Quizzes",
      desc: "Generate quizzes from your own learning materials and test what you actually know.",
      icon: "✓",
      number: "04",
    },
    {
      title: "Learning Chat",
      desc: "Have an intelligent conversation with your documents and continue learning naturally.",
      icon: "◌",
      number: "05",
    },
    {
      title: "Source Grounded",
      desc: "Learn with confidence. Answers are connected to the content you uploaded.",
      icon: "◇",
      number: "06",
    },
  ];

  // Pointer tracking
  useEffect(() => {
    const handleMove = (e) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      setPointer({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, []);

  // Rotating words
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2300);

    return () => clearInterval(interval);
  }, []);

  // Auto highlight features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [features.length]);

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#050509] text-white"
    >
      {/* ===================== BACKGROUND ===================== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] transition-all duration-500"
          style={{
            left: `${pointer.x}%`,
            top: `${pointer.y}%`,
            background:
              "radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.08) 35%, transparent 70%)",
          }}
        />

        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute bottom-[-300px] right-[-200px] h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />

        {[...Array(60)].map((_, i) => {
          const left = (i * 37) % 100;
          const top = (i * 61) % 100;
          const size = 1 + (i % 3);

          return (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                opacity: 0.15 + (i % 5) * 0.08,
                animation: `particleFloat ${5 + (i % 6)}s ease-in-out infinite`,
                animationDelay: `${(i % 8) * 0.4}s`,
              }}
            />
          );
        })}
      </div>

      {/* ===================== HERO ===================== */}
      {/* Extra top padding so content sits below the floating navbar */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-36 sm:pt-40 lg:px-8 lg:pb-36 lg:pt-44">
        <div className="relative mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="animate-float mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-zinc-300 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-400" />
            </span>
            <span>AI-powered learning, built for curious minds</span>
            <span className="text-indigo-400">✦</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-black leading-[1.08] tracking-[-0.04em] sm:text-5xl md:text-6xl lg:text-7xl">
            Turn what you study
            <br />
            into{" "}
            <span className="relative inline-block min-w-[9ch] text-left align-bottom sm:min-w-[11ch]">
              <span
                key={wordIndex}
                className="inline-block bg-gradient-to-r from-indigo-300 via-violet-400 to-purple-400 bg-clip-text text-transparent"
                style={{ animation: "wordEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                {rotatingWords[wordIndex]}
              </span>
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            Upload your learning materials and let LearnAI transform them into
            explanations, summaries, conversations and quizzes — so you can
            understand more and memorize less.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-2xl bg-white px-8 text-sm font-bold text-black shadow-2xl shadow-white/10 transition duration-300 hover:-translate-y-1 hover:shadow-white/20"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-indigo-200/70 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">Start learning for free</span>
              <span className="relative ml-3 text-lg transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <button
              onClick={scrollToFeatures}
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-8 text-sm font-semibold text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08]"
            >
              Explore LearnAI
              <span className="ml-3 text-zinc-500">↓</span>
            </button>
          </div>

          {/* Trust line */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-zinc-600">
            <span>✦ No complicated setup</span>
            <span className="hidden sm:inline">•</span>
            <span>Learn from your own materials</span>
          </div>

          {/* Floating Visual */}
          <div className="relative mx-auto mt-20 h-[340px] max-w-5xl sm:mt-24 sm:h-[420px]">
            <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-400/10 sm:h-[360px] sm:w-[360px]" />
            <div
              className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/[0.07] sm:h-[480px] sm:w-[480px]"
              style={{ animation: "spinSlow 28s linear infinite" }}
            />

            <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-52 sm:w-52">
              <div className="absolute inset-0 animate-pulse rounded-full bg-indigo-500/10 blur-3xl" />
              <div className="absolute inset-4 rounded-full border border-indigo-400/20 bg-indigo-500/[0.04] backdrop-blur-2xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 shadow-2xl shadow-indigo-500/20 sm:h-24 sm:w-24">
                <span className="text-3xl font-black text-indigo-300 sm:text-4xl">
                  AI
                </span>
              </div>
            </div>

            {/* Floating cards (same as before) */}
            <div
              className="absolute left-[2%] top-[12%] hidden w-48 rotate-[-7deg] rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left shadow-2xl backdrop-blur-xl sm:block lg:w-52 lg:p-5"
              style={{ animation: "cardFloat 5.5s ease-in-out infinite" }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-xs font-bold text-red-400">
                  PDF
                </div>
                <div>
                  <div className="text-sm font-semibold">Lecture.pdf</div>
                  <div className="text-xs text-zinc-500">24 pages</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full rounded-full bg-white/10" />
                <div className="h-1.5 w-4/5 rounded-full bg-white/10" />
                <div className="h-1.5 w-3/5 rounded-full bg-white/10" />
              </div>
              <div className="mt-3 text-xs text-indigo-300">Processing with AI...</div>
            </div>

            <div
              className="absolute right-[2%] top-[14%] hidden w-52 rotate-[6deg] rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.06] p-4 text-left shadow-2xl shadow-indigo-500/10 backdrop-blur-xl sm:block lg:w-56 lg:p-5"
              style={{ animation: "cardFloat 6.2s ease-in-out infinite reverse" }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-xs text-indigo-300">
                  ✦
                </span>
                <span className="text-xs font-semibold text-indigo-300">LearnAI</span>
              </div>
              <p className="text-sm leading-6 text-zinc-300">
                "In simple terms, this concept means..."
              </p>
              <div className="mt-3 flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 [animation-delay:300ms]" />
              </div>
            </div>

            <div
              className="absolute bottom-[4%] left-[12%] hidden w-48 rotate-[4deg] rounded-2xl border border-white/10 bg-black/40 p-4 text-left shadow-2xl backdrop-blur-xl md:block"
              style={{ animation: "cardFloat 7s ease-in-out infinite" }}
            >
              <div className="text-xs uppercase tracking-widest text-zinc-500">
                Practice
              </div>
              <div className="mt-1.5 text-sm font-semibold">Quick quiz generated</div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  ✓
                </div>
                <div className="text-xs text-zinc-400">8 questions ready</div>
              </div>
            </div>

            <div
              className="absolute bottom-[2%] right-[10%] hidden w-48 rotate-[-4deg] rounded-2xl border border-white/10 bg-black/40 p-4 text-left shadow-2xl backdrop-blur-xl md:block"
              style={{ animation: "cardFloat 6.8s ease-in-out infinite reverse" }}
            >
              <div className="text-xs uppercase tracking-widest text-zinc-500">
                Summary
              </div>
              <div className="mt-1.5 text-sm font-semibold">Key ideas discovered</div>
              <div className="mt-3 space-y-2">
                <div className="h-1.5 w-full rounded-full bg-indigo-400/30" />
                <div className="h-1.5 w-4/5 rounded-full bg-violet-400/20" />
                <div className="h-1.5 w-3/5 rounded-full bg-purple-400/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== MARQUEE ===================== */}
      <div className="relative z-10 overflow-hidden border-y border-white/[0.06] bg-white/[0.015] py-5">
        <div className="animate-marquee flex min-w-max items-center gap-12 text-sm font-medium text-zinc-600">
          {[
            "READ",
            "UNDERSTAND",
            "ASK",
            "EXPLAIN",
            "PRACTICE",
            "MASTER",
            "READ",
            "UNDERSTAND",
            "ASK",
            "EXPLAIN",
            "PRACTICE",
            "MASTER",
          ].map((item, index) => (
            <span key={index} className="flex items-center gap-12">
              {item}
              <span className="text-indigo-500/50">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ===================== FEATURES ===================== */}
      <section
        id="features"
        className="relative z-10 mx-auto max-w-7xl scroll-mt-28 px-6 py-28 lg:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">
            Everything in one place
          </div>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Your study materials.
            <br />
            <span className="text-zinc-500">Supercharged by AI.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
            LearnAI turns static learning materials into an interactive experience
            designed around the way you actually learn.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              onMouseEnter={() => setActiveFeature(index)}
              className={`group relative overflow-hidden rounded-3xl border p-7 transition-all duration-500 ${
                activeFeature === index
                  ? "border-indigo-400/30 bg-indigo-500/[0.07] shadow-2xl shadow-indigo-500/[0.07]"
                  : "border-white/[0.07] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.04]"
              }`}
            >
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl transition group-hover:bg-indigo-500/20" />

              <div className="relative flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl text-indigo-300 transition duration-300 group-hover:scale-110 group-hover:border-indigo-400/30">
                  {feature.icon}
                </div>
                <span className="text-xs font-bold text-zinc-700">
                  {feature.number}
                </span>
              </div>

              <h3 className="relative mt-6 text-xl font-bold">{feature.title}</h3>
              <p className="relative mt-3 text-sm leading-7 text-zinc-500 transition group-hover:text-zinc-400">
                {feature.desc}
              </p>

              <div className="relative mt-6 flex items-center text-xs font-semibold text-indigo-400 opacity-70 transition group-hover:translate-x-1 group-hover:opacity-100">
                Explore feature
                <span className="ml-2">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section
        id="how-it-works"
        className="relative z-10 scroll-mt-28 border-y border-white/[0.06] bg-white/[0.015]"
      >
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-8 lg:py-32">
          <div className="text-center">
            <div className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">
              Simple by design
            </div>
            <h2 className="text-3xl font-black sm:text-4xl md:text-5xl">
              From material to mastery
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-zinc-500">
              Three simple steps between you and a smarter learning experience.
            </p>
          </div>

          <div className="relative mt-16 grid gap-10 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent md:block" />

            {[
              {
                number: "01",
                title: "Upload",
                desc: "Bring your PDFs, documents, notes and learning materials into LearnAI.",
              },
              {
                number: "02",
                title: "Interact",
                desc: "Ask questions, request summaries, generate explanations and chat with your material.",
              },
              {
                number: "03",
                title: "Master",
                desc: "Practice with quizzes, review your conversations and build deeper understanding.",
              },
            ].map((item) => (
              <div key={item.number} className="relative text-center">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-indigo-400/20 bg-[#0a0a12] text-lg font-black text-indigo-300 shadow-2xl shadow-indigo-500/10">
                  <div className="absolute inset-0 rounded-3xl bg-indigo-500/5" />
                  <span className="relative">{item.number}</span>
                </div>
                <h3 className="mt-7 text-2xl font-bold">{item.title}</h3>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-zinc-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== AI SHOWCASE ===================== */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-8 lg:py-32">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/[0.08] via-white/[0.02] to-violet-500/[0.08] p-8 sm:p-12 lg:p-16">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px]" />

          <div className="relative grid items-center gap-14 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-300">
                Learn differently
              </div>
              <h2 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
                Don't just read.
                <br />
                <span className="text-indigo-400">Understand.</span>
              </h2>
              <p className="mt-6 max-w-xl leading-8 text-zinc-400">
                Instead of spending hours searching through pages of notes, talk to
                your learning materials and let AI help you discover the important
                ideas.
              </p>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black transition hover:-translate-y-1"
              >
                Try LearnAI
                <span className="ml-3">→</span>
              </Link>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="rounded-3xl border border-white/10 bg-black/40 p-5 shadow-2xl backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-xs text-indigo-300">
                      ✦
                    </div>
                    <span className="text-sm font-semibold">LearnAI</span>
                  </div>
                  <span className="text-xs text-zinc-600">AI tutor</span>
                </div>

                <div className="space-y-4">
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">
                    Explain this topic in simple terms.
                  </div>
                  <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.035] px-4 py-4 text-sm leading-6 text-zinc-300">
                    Of course. Think of it this way...
                    <br />
                    <br />
                    <span className="text-zinc-500">
                      LearnAI is explaining the concept directly from your uploaded
                      material.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <span className="text-indigo-400">✓</span>
                    Based on your document
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-5 rounded-2xl border border-white/10 bg-[#0b0b12]/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600">
                  Understanding
                </div>
                <div className="mt-1 text-sm font-bold text-emerald-400">
                  Improving ✦
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28 lg:px-8 lg:pb-36">
        <div className="relative overflow-hidden rounded-[2rem] border border-indigo-400/10 bg-gradient-to-b from-indigo-500/[0.10] to-violet-500/[0.04] px-6 py-20 text-center sm:px-16 sm:py-24">
          <div className="absolute left-1/2 top-[-100px] h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[100px]" />

          <div className="relative">
            <div className="mb-6 text-3xl">✦</div>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl md:text-6xl">
              Ready to learn
              <br />
              <span className="text-indigo-400">smarter?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl leading-7 text-zinc-500">
              Turn your documents into an interactive AI learning experience and
              start understanding more today.
            </p>
            <Link
              to="/register"
              className="group mt-10 inline-flex items-center rounded-2xl bg-white px-8 py-4 text-sm font-bold text-black shadow-2xl transition duration-300 hover:-translate-y-1 hover:shadow-white/10"
            >
              Create your free account
              <span className="ml-3 transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== ANIMATIONS ===================== */}
      <style>{`
        @keyframes particleFloat {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.15; }
          50% { transform: translate3d(0, -18px, 0); opacity: 0.7; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        @keyframes cardFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -14px, 0); }
        }

        @keyframes wordEnter {
          0% { opacity: 0; transform: translateY(16px) scale(0.96); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes spinSlow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-marquee {
          animation: marquee 32s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Landing;