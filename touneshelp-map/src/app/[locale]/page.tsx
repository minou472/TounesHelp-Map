import { Link } from "@/i18n/routing";
import LanguageSwitcher from "@/components/language-switcher";

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
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 rounded-2xl blur opacity-0 transition-opacity group-hover:opacity-100"></div>
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

            <div className="hidden items-center gap-8 md:flex">
              <a
                href="#about"
                className="text-slate-700 hover:text-cyan-600 font-semibold transition-all py-2 hover:-translate-y-0.5"
              >
                About
              </a>
              <a
                href="#mission"
                className="text-slate-700 hover:text-emerald-600 font-semibold transition-all py-2 hover:-translate-y-0.5"
              >
                Mission
              </a>
              <a
                href="#cases"
                className="text-slate-700 hover:text-orange-600 font-semibold transition-all py-2 hover:-translate-y-0.5"
              >
                Cases
              </a>
              <a
                href="#contact"
                className="text-slate-700 hover:text-purple-600 font-semibold transition-all py-2 hover:-translate-y-0.5"
              >
                Contact
              </a>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher variant="buttons" />
              <Link
                href="/fr/login"
                className="hidden md:block rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-800 px-6 py-2.5 font-semibold border border-slate-200 hover:border-slate-300 transition-all hover:shadow-md text-sm"
              >
                Sign In
              </Link>
              <Link
                href="/fr/register"
                className="rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 px-6 py-2.5 font-bold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm ring-2 ring-cyan-500/30"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-block rounded-full bg-cyan-100 px-4 py-1.5 text-sm font-medium text-cyan-700 mb-6">
                🏛️ Tunisia's Community Help Platform
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Helping Those in Need,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-600">
                  Together
                </span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0">
                Bridging the gap between marginalized communities in Tunisia's
                underserved regions and the organizations, volunteers, and
                donors who can help them.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/fr/cases"
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
                  href="/fr/cases/new"
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
                <div className="h-12 w-px bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600">24</div>
                  <div className="text-sm text-slate-500">Governorates</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-30 blur-2xl"></div>
              <div className="relative rounded-3xl bg-white p-8 shadow-2xl border border-slate-100">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <div className="text-slate-600 font-medium">
                      Interactive Map
                    </div>
                    <div className="text-slate-400 text-sm">
                      Tunisia Coverage
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="rounded-xl bg-emerald-50 p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      150+
                    </div>
                    <div className="text-xs text-emerald-700">Resolved</div>
                  </div>
                  <div className="rounded-xl bg-cyan-50 p-4 text-center">
                    <div className="text-2xl font-bold text-cyan-600">80+</div>
                    <div className="text-xs text-cyan-700">In Progress</div>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      120+
                    </div>
                    <div className="text-xs text-amber-700">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-20" id="about">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              How TounesHelp Works
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform connects those in need with helpers through a
              transparent, community-driven approach.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-slate-100 hover:shadow-xl transition">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl mb-6">
                📍
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                1. Submit a Case
              </h3>
              <p className="text-slate-600">
                Report a case in your area with location details, photos, and
                description of the situation.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg border border-slate-100 hover:shadow-xl transition">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-100 text-2xl mb-6">
                ✅
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                2. Verification
              </h3>
              <p className="text-slate-600">
                Our team reviews and verifies each case to ensure authenticity
                and appropriate handling.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg border border-slate-100 hover:shadow-xl transition">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-2xl mb-6">
                🤝
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                3. Get Help
              </h3>
              <p className="text-slate-600">
                Connect with organizations, volunteers, and donors who can
                provide the needed support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20" id="mission">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                TounesHelp-Map is a community-driven platform to surface urgent
                needs in underserved regions of Tunisia. We connect people in
                need with responders through clear status updates, map-based
                transparency, and trust-driven moderation.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 shrink-0">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Visibility</h4>
                    <p className="text-slate-600 text-sm">
                      Every case is visible on the map for transparency
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Accountability
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Track case status from submission to resolution
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Community Support
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Connect with volunteers and organizations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 text-white">
                <div className="text-4xl font-bold">24</div>
                <div className="text-cyan-100">Governorates</div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white">
                <div className="text-4xl font-bold">500+</div>
                <div className="text-emerald-100">Cases Reported</div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                <div className="text-4xl font-bold">150+</div>
                <div className="text-blue-100">Resolved</div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white">
                <div className="text-4xl font-bold">50+</div>
                <div className="text-amber-100">Organizations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-600 to-emerald-600 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-cyan-100 mb-10">
            Join our community of helpers and make a positive impact in Tunisia.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/fr/register"
              className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-cyan-600 shadow-lg hover:bg-cyan-50 transition"
            >
              Create Account
            </Link>
            <Link
              href="/fr/cases"
              className="rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition"
            >
              Browse Cases
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12" id="contact">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 text-white font-bold text-xl">
                  T
                </div>
                <span className="text-xl font-bold text-white">TounesHelp</span>
              </div>
              <p className="text-slate-400 max-w-md">
                Bridging the gap between marginalized communities in Tunisia's
                underserved regions and the organizations, volunteers, and
                donors who can help them.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/fr/cases"
                    className="text-slate-400 hover:text-cyan-400 transition"
                  >
                    Browse Cases
                  </Link>
                </li>
                <li>
                  <Link
                    href="/fr/cases/new"
                    className="text-slate-400 hover:text-cyan-400 transition"
                  >
                    Submit Case
                  </Link>
                </li>
                <li>
                  <Link
                    href="/fr/login"
                    className="text-slate-400 hover:text-cyan-400 transition"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/fr/register"
                    className="text-slate-400 hover:text-cyan-400 transition"
                  >
                    Register
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400">
                <li>📧 support@touneshelp.tn</li>
                <li>📞 +216 70 000 000</li>
                <li>📍 Tunisia</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>© 2024 TounesHelp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
