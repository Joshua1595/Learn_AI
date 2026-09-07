import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { saveToken } from "../utils/storage";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(form);

      console.log("LOGIN RESPONSE:", data);

      const token =
        data?.session?.access_token ||
        data?.access_token ||
        data?.token;

      if (!token) {
        throw new Error("Login succeeded but no access token was returned.");
      }

      saveToken(token);

      navigate("/dashboard");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#07070c] px-4 py-12 sm:px-6 lg:px-8"
    >
      {/* ========== Interactive Background ========== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main pointer-following glow */}
        <div
          className="absolute h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[100px] transition-all duration-300 ease-out"
          style={{
            left: `${pointer.x}%`,
            top: `${pointer.y}%`,
          }}
        />

        {/* Secondary softer glow */}
        <div
          className="absolute h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/15 blur-[80px] transition-all duration-500 ease-out"
          style={{
            left: `${pointer.x}%`,
            top: `${pointer.y}%`,
          }}
        />

        {/* Static ambient orbs */}
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />

        {/* Floating stars that slightly react to pointer */}
        {[...Array(45)].map((_, i) => {
          const baseX = (i * 17) % 100;
          const baseY = (i * 23) % 100;
          const size = (i % 3) + 1;

          // slight attraction toward pointer
          const offsetX = (pointer.x - 50) * 0.04;
          const offsetY = (pointer.y - 50) * 0.04;

          return (
            <div
              key={i}
              className="absolute rounded-full bg-white transition-transform duration-700 ease-out"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `calc(${baseX}% + ${offsetX}px)`,
                top: `calc(${baseY}% + ${offsetY}px)`,
                opacity: 0.25 + (i % 5) * 0.12,
                animation: `twinkle ${4 + (i % 5)}s ease-in-out infinite`,
                animationDelay: `${(i % 7) * 0.4}s`,
              }}
            />
          );
        })}
      </div>

      {/* ========== Main Content ========== */}
      <div className="relative z-10 w-full max-w-[420px]">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Sign in to continue to your account
          </p>
        </div>

        {/* Attractive Glass Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-10">
          {/* Soft top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Very subtle inner glow */}
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-500/10 to-transparent opacity-60" />

          {error && (
            <div className="relative mb-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3.5">
              <p className="text-sm font-medium text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white placeholder-zinc-500 shadow-inner transition focus:border-indigo-400/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/25 sm:text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white placeholder-zinc-500 shadow-inner transition focus:border-indigo-400/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/25 sm:text-sm"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#07070c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {/* Shine effect on hover */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

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
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-zinc-500">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-400 transition hover:text-indigo-300"
          >
            Create one
          </Link>
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}

export default Login;