"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import LanguageSwitcher from "@/components/language-switcher";

type CaseItem = {
  id: string;
  title: string;
  description: string;
  governorate: string;
  city?: string;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  STILL_SUFFERING: "Still Suffering",
  PENDING_REVIEW: "Pending Review",
  REJECTED: "Rejected",
};

const statusStyles: Record<string, string> = {
  ACTIVE: "text-emerald-700 bg-emerald-100 border-emerald-200",
  IN_PROGRESS: "text-blue-700 bg-blue-100 border-blue-200",
  RESOLVED: "text-slate-700 bg-slate-100 border-slate-200",
  STILL_SUFFERING: "text-rose-700 bg-rose-100 border-rose-200",
  PENDING_REVIEW: "text-yellow-700 bg-yellow-100 border-yellow-200",
  REJECTED: "text-red-700 bg-red-100 border-red-200",
};

function toQueryString(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v.trim().length) query.set(k, v);
  });
  return query.toString() ? `?${query.toString()}` : "";
}

export default function CasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [caseType, setCaseType] = useState<
    "all" | "treated" | "not-treated" | "rejected"
  >("treated");
  const [viewMode, setViewMode] = useState<"carousel" | "all">("carousel");
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);

  const pathname = usePathname();
  const locale = useMemo(() => {
    if (!pathname) return "fr";
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] || "fr";
  }, [pathname]);

  const pagePrefix = `/${locale}`;

  const filteredCases = useMemo(() => {
    if (caseType === "treated") {
      return cases.filter((item) =>
        ["RESOLVED", "IN_PROGRESS", "ACTIVE"].includes(item.status)
      );
    }

    if (caseType === "not-treated") {
      return cases.filter((item) =>
        ["STILL_SUFFERING", "PENDING_REVIEW"].includes(item.status)
      );
    }

    if (caseType === "rejected") {
      return cases.filter((item) => item.status === "REJECTED");
    }

    return cases;
  }, [cases, caseType]);

  const featuredCases = useMemo(() => {
    const treated = cases.filter((item) =>
      ["RESOLVED", "IN_PROGRESS", "ACTIVE"].includes(item.status)
    );
    return treated.slice(0, 8);
  }, [cases]);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);

    try {
      const query = toQueryString({
        search: search || undefined,
        governorate: governorate || undefined,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
      });

      const response = await fetch(`/api/cases${query}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data: CaseItem[] = await response.json();
      setCases(data);
      if (data.length > 0 && !data.find((c) => c.id === selectedCase?.id)) {
        setSelectedCase(data[0]);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to fetch cases. Please try again later.");
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (filteredCases.length > 0) {
      if (!filteredCases.some((c) => c.id === selectedCase?.id)) {
        setSelectedCase(filteredCases[0]);
      }
    } else {
      setSelectedCase(null);
    }
  }, [filteredCases]);

  const hasCoordinates = useMemo(
    () => cases.some((item) => item.latitude != null && item.longitude != null),
    [cases]
  );

  const displayCases = viewMode === "carousel" ? featuredCases : filteredCases;

  const mapUrl = useMemo(() => {
    const active =
      selectedCase &&
      selectedCase.latitude != null &&
      selectedCase.longitude != null;
    if (!active) return null;
    const lat = selectedCase.latitude;
    const lng = selectedCase.longitude;
    const bbox = `${lng! - 0.04},${lat! - 0.02},${lng! + 0.04},${lat! + 0.02}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  }, [selectedCase]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cases Directory</h1>
          <p className="mt-1 text-slate-600">
            Browse and locate cases around Tunisia.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher variant="buttons" className="" />
          <div className="flex gap-2">
            <Link
              href={`${pagePrefix}/cases/new`}
              className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Submit a Case
            </Link>
            <Link
              href={`${pagePrefix}/login`}
              className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: "all", label: "All Cases" },
          { key: "treated", label: "Treated Cases" },
          { key: "not-treated", label: "Non-treated Cases" },
          { key: "rejected", label: "Rejected Cases" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCaseType(tab.key as any)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              caseType === tab.key
                ? "bg-cyan-600 text-white shadow-lg"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex justify-end">
        <button
          className="rounded-full border border-indigo-300 bg-white px-4 py-2 text-slate-700 hover:bg-indigo-50"
          onClick={() =>
            setViewMode(viewMode === "carousel" ? "all" : "carousel")
          }
        >
          {viewMode === "carousel" ? "See All Cases" : "Back to Featured"}
        </button>
      </div>

      <section className="rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200 mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search by title, description, governorate, city"
            className="w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            value={governorate}
            onChange={(e) => setGovernorate(e.target.value)}
            type="text"
            placeholder="Governorate"
            className="w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="STILL_SUFFERING">Still Suffering</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-600">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            onClick={fetchCases}
            className="h-12 rounded-lg bg-indigo-600 px-4 font-semibold text-white hover:bg-indigo-700"
          >
            Apply Filters
          </button>
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {viewMode === "carousel" ? "Swipe Through Cases" : "All Cases"}
        </h2>
        {loading ? (
          <p className="text-slate-600">Loading cases...</p>
        ) : displayCases.length === 0 ? (
          <p className="text-slate-600">No cases available for this filter.</p>
        ) : (
          <div
            className={`flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 ${
              viewMode === "carousel" ? "" : "flex-wrap"
            }`}
          >
            {displayCases.map((card) => (
              <article
                key={card.id}
                onClick={() => setSelectedCase(card)}
                className={`snap-center min-w-[90%] md:min-w-[30%] p-4 rounded-2xl border transition cursor-pointer ${
                  selectedCase?.id === card.id
                    ? "bg-gradient-to-br from-cyan-50 to-emerald-50 border-cyan-200 shadow-lg"
                    : "bg-white border-slate-200 hover:shadow-xl"
                }`}
              >
                <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                  {card.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{card.governorate}</span>
                  <span>{statusLabels[card.status] || card.status}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(card.createdAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200 h-fit">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Map view
          </h2>
          {loading ? (
            <p className="text-slate-600">Loading map...</p>
          ) : !hasCoordinates ? (
            <p className="text-slate-600">
              No geographic data available for this filter.
            </p>
          ) : !selectedCase ? (
            <p className="text-slate-600">
              Select a case on the right to preview the map.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm text-slate-500">Selected case</p>
                <h3 className="text-md font-semibold text-slate-900">
                  {selectedCase.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {selectedCase.governorate} / {selectedCase.city || "—"}
                </p>
                <p className="text-sm text-slate-600">
                  {selectedCase.latitude?.toFixed(5)},{" "}
                  {selectedCase.longitude?.toFixed(5)}
                </p>
              </div>
              <div className="aspect-video border border-slate-300 rounded-lg overflow-hidden">
                <iframe
                  title="Case location"
                  src={mapUrl || "about:blank"}
                  width="100%"
                  height="100%"
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-slate-500">
                Powered by OpenStreetMap. Use this panel as a preview; click the
                case title on right for details.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Cases list</h2>
            <span className="text-sm text-slate-500">
              {filteredCases.length} results
            </span>
          </div>

          {loading ? (
            <div className="text-slate-600">Loading cases…</div>
          ) : error ? (
            <div className="text-rose-600">{error}</div>
          ) : filteredCases.length === 0 ? (
            <div className="text-slate-600">
              No cases found with current filters.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCases.map((caseItem) => {
                const isSelected = selectedCase?.id === caseItem.id;
                return (
                  <article
                    key={caseItem.id}
                    className={`rounded-lg border p-3 md:p-4 cursor-pointer transition ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 bg-white hover:shadow"
                    }`}
                    onClick={() => setSelectedCase(caseItem)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {caseItem.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {caseItem.governorate}{" "}
                          {caseItem.city ? `• ${caseItem.city}` : ""}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${statusStyles[caseItem.status] || "text-slate-700 bg-slate-100 border-slate-200"}`}
                      >
                        {statusLabels[caseItem.status] || caseItem.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700 line-clamp-2">
                      {caseItem.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {caseItem.latitude && caseItem.longitude ? (
                        <span>
                          📍 {caseItem.latitude.toFixed(4)},{" "}
                          {caseItem.longitude.toFixed(4)}
                        </span>
                      ) : (
                        <span>📍 location missing</span>
                      )}
                      <span>
                        ⏱ {new Date(caseItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Link
                      href={`${pagePrefix}/cases/${caseItem.id}`}
                      className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:underline"
                    >
                      View case details
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-xl bg-slate-900 p-6 text-white shadow-lg">
        <h2 className="text-xl font-semibold text-cyan-200 mb-3">
          About TounesHelp-Map
        </h2>
        <p className="text-sm text-slate-200 leading-relaxed">
          TounesHelp-Map is a community-driven platform to surface urgent needs
          in underserved regions of Tunisia. We connect people in need with
          responders through clear status updates, map-based transparency, and
          trust-driven moderation. Your support helps accelerate action for
          families and neighborhoods that are still waiting.
        </p>
        <ul className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-300">
          <li className="rounded-lg bg-slate-800 p-3">
            <strong className="block text-cyan-100">Mission:</strong>
            Visibility, accountability and support.
          </li>
          <li className="rounded-lg bg-slate-800 p-3">
            <strong className="block text-cyan-100">Values:</strong>
            Empathy, transparency, fairness.
          </li>
          <li className="rounded-lg bg-slate-800 p-3">
            <strong className="block text-cyan-100">Impact:</strong>
            Every case updated moves us closer to a safer community.
          </li>
        </ul>
      </section>
    </div>
  );
}
