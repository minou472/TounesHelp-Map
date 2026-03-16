import React from "react";
import LanguageSwitcher from "../components/language-switcher";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-lg sticky top-0 z-50 supports-[backdrop-filter:blur()]:bg-white/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="group relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-emerald-500 shadow-lg ring-2 ring-white/30 transition-all hover:scale-110 hover:shadow-xl">
                  <span className="text-xl font-bold text-white drop-shadow-lg">
                    T
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent drop-shadow-lg">
                  TounesHelp
                </h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                  Community Impact Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher variant="dropdown" />
              <Link
                to="/login"
                className="rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-800 px-6 py-2.5 font-semibold border border-slate-200 hover:border-slate-300 transition-all hover:shadow-md text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 px-6 py-2.5 font-bold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm ring-2 ring-cyan-500/30"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Ported from Next.js */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <div className="inline-block rounded-full bg-cyan-100 px-4 py-1.5 text-sm font-medium text-cyan-700 mb-6">
                🏛️ Tunisia's Community Help Platform
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Helping Those in Need,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-600">
                  Together
                </span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 max-w-2xl">
                Bridging the gap between marginalized communities in Tunisia's
                underserved regions and the organizations, volunteers, and
                donors who can help them.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/cases"
                  className="flex items-center justify-center rounded-full bg-cyan-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 hover:bg-cyan-700"
                >
                  Browse Cases
                  <svg
                    className="ml-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
                <Link
                  to="/cases/new"
                  className="flex items-center justify-center rounded-full border-2 border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-700 transition-all hover:border-cyan-500 hover:text-cyan-600"
                >
                  Submit a Case
                </Link>
              </div>
              <div className="mt-10 flex items-center justify-center gap-8 lg:justify-start">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600">500+</div>
                  <div className="text-sm text-slate-500">Cases Helped</div>
                </div>
                <div className="h-12 w-px bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    200+
                  </div>
                  <div className="text-sm text-slate-500">Volunteers</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-30 blur-2xl" />
              <div className="relative rounded-3xl bg-white p-8 shadow-2xl border border-slate-100">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="mx-auto h-24 w-24 text-slate-400 mb-4" />
                    <div className="text-slate-600 font-medium">
                      Interactive Map
                    </div>
                    <div className="text-slate-400 text-sm">
                      Tunisia Coverage
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
