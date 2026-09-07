
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getToken, removeToken } from "../utils/storage";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    removeToken();
    setMobileOpen(false);
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <nav
          className={`
            mx-auto w-full max-w-6xl
            overflow-visible
            rounded-2xl
            border
            transition-all
            duration-500
            ${
              scrolled
                ? "border-white/10 bg-[#09090f]/80 shadow-2xl shadow-black/30 backdrop-blur-2xl"
                : "border-white/[0.04] bg-[#09090f]/40 backdrop-blur-xl"
            }
          `}
        >
          <div className="flex h-[64px] items-center justify-between px-4 sm:px-6">

            {/* =================================================
                LOGO
            ================================================== */}

            <Link
              to={token ? "/dashboard" : "/"}
              className="group flex items-center gap-3"
            >
              {/* Logo mark */}
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/40">
                
                {/* Shine */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                {/* Logo */}
                <span className="relative text-lg font-black text-white">
                  L
                </span>
              </div>

              {/* Brand */}
              <div className="flex items-center">
                <span className="text-lg font-bold tracking-tight text-white">
                  Learn
                </span>
                <span className="text-lg font-bold tracking-tight text-indigo-400">
                  AI
                </span>
              </div>
            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================== */}

            <div className="hidden items-center gap-1 md:flex">

              {token ? (
                <>
                  {/* Dashboard */}
                  <Link
                    to="/dashboard"
                    className={`
                      group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300
                      ${
                        isActive("/dashboard")
                          ? "text-white"
                          : "text-zinc-400 hover:text-white"
                      }
                    `}
                  >
                    <svg
                      className={`h-4 w-4 transition ${
                        isActive("/dashboard")
                          ? "text-indigo-400"
                          : "text-zinc-500 group-hover:text-indigo-400"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 12l9-9 9 9M5 10v9a2 2 0 002 2h10a2 2 0 002-2v-9"
                      />
                    </svg>

                    Dashboard

                    {isActive("/dashboard") && (
                      <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50" />
                    )}
                  </Link>

                  {/* Documents */}
                  <Link
                    to="/documents"
                    className={`
                      group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300
                      ${
                        isActive("/documents")
                          ? "text-white"
                          : "text-zinc-400 hover:text-white"
                      }
                    `}
                  >
                    <svg
                      className={`h-4 w-4 transition ${
                        isActive("/documents")
                          ? "text-indigo-400"
                          : "text-zinc-500 group-hover:text-indigo-400"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 3v5h5"
                      />
                    </svg>

                    Documents

                    {isActive("/documents") && (
                      <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50" />
                    )}
                  </Link>

                  {/* Divider */}
                  <div className="mx-2 h-6 w-px bg-white/10" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="group ml-1 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <svg
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12H3m0 0l4-4m-4 4l4 4"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 5V3a1 1 0 011-1h6a1 1 0 011 1v18a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2"
                      />
                    </svg>

                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Landing links */}
                  {location.pathname === "/" && (
                    <>
                      <a
                        href="#features"
                        className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
                      >
                        Features
                      </a>

                      <a
                        href="#how-it-works"
                        className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
                      >
                        How it works
                      </a>

                      <div className="mx-2 h-6 w-px bg-white/10" />
                    </>
                  )}

                  {/* Sign in */}
                  <Link
                    to="/login"
                    className={`
                      rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300
                      ${
                        location.pathname === "/login"
                          ? "bg-white/10 text-white"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }
                    `}
                  >
                    Sign in
                  </Link>

                  {/* CTA */}
                  <Link
                    to="/register"
                    className="group relative ml-1 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/40"
                  >
                    {/* Shine */}
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                    <span className="relative">
                      Get Started
                    </span>

                    <svg
                      className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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
                </>
              )}
            </div>

            {/* =================================================
                MOBILE MENU BUTTON
            ================================================== */}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M6 18L18 6"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 7h16M4 12h16M4 17h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* =================================================
              MOBILE MENU
          ================================================== */}

          <div
            className={`
              overflow-hidden border-t border-white/[0.06] transition-all duration-300 md:hidden
              ${
                mobileOpen
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0"
              }
            `}
          >
            <div className="space-y-2 p-4">

              {token ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                      isActive("/dashboard")
                        ? "bg-indigo-500/10 text-white"
                        : "text-zinc-400"
                    }`}
                  >
                    <span>⌂</span>
                    Dashboard
                  </Link>

                  <Link
                    to="/documents"
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                      isActive("/documents")
                        ? "bg-indigo-500/10 text-white"
                        : "text-zinc-400"
                    }`}
                  >
                    <span>▱</span>
                    Documents
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                  >
                    <span>↪</span>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {location.pathname === "/" && (
                    <>
                      <a
                        href="#features"
                        className="block rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
                      >
                        Features
                      </a>

                      <a
                        href="#how-it-works"
                        className="block rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
                      >
                        How it works
                      </a>
                    </>
                  )}

                  <Link
                    to="/login"
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
                  >
                    Sign in
                  </Link>

                  <Link
                    to="/register"
                    className="block rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20"
                  >
                    Get Started →
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

export default Navbar;

