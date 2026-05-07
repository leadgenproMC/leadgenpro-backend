"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getString } from "@/lib/i18n";

export default function Hero() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || "en";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className="w-fit">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                {getString(locale, "hero.badge")}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {getString(locale, "hero.title.part1")}{" "}
              <span className="text-blue-600">
                {getString(locale, "hero.title.part2")}
              </span>{" "}
              {getString(locale, "hero.title.part3")}
            </h1>

            {/* Subtitle */}
            <p className="max-w-lg text-lg text-gray-600">
              {getString(locale, "hero.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-8 py-4 text-base font-medium text-gray-900 transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-400/30"
              >
                {getString(locale, "hero.cta.primary")}
              </Link>
              <button className="inline-flex items-center gap-2 text-base font-medium text-gray-600 transition-colors hover:text-gray-900">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {getString(locale, "hero.cta.secondary")}
              </button>
            </div>
          </div>

          {/* Right Content - Dashboard Mockup */}
          <div className="relative">
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-2 shadow-2xl shadow-slate-900/50">
              <div className="rounded-xl bg-slate-950 p-4">
                {/* Dashboard Header */}
                <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-slate-400">{getString(locale, "hero.mock.dashboard")}</span>
                </div>

                {/* Dashboard Content */}
                <div className="space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-slate-800/50 p-3">
                      <div className="text-xs text-slate-400">{getString(locale, "hero.mock.totalLeads")}</div>
                      <div className="text-lg font-semibold text-emerald-400">2,847</div>
                    </div>
                    <div className="rounded-lg bg-slate-800/50 p-3">
                      <div className="text-xs text-slate-400">{getString(locale, "hero.mock.conversion")}</div>
                      <div className="text-lg font-semibold text-blue-400">24.5%</div>
                    </div>
                    <div className="rounded-lg bg-slate-800/50 p-3">
                      <div className="text-xs text-slate-400">{getString(locale, "hero.mock.revenue")}</div>
                      <div className="text-lg font-semibold text-purple-400">$48.2K</div>
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="rounded-lg bg-slate-800/30 p-4">
                    <div className="mb-3 text-xs text-slate-400">{getString(locale, "hero.mock.trend")}</div>
                    <div className="flex items-end gap-1 h-24">
                      {[40, 65, 45, 80, 55, 90, 75, 100, 85, 110, 95, 125].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/20 to-emerald-400 hover:from-emerald-500/40 hover:to-emerald-300 transition-all"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                      <span>{getString(locale, "hero.mock.jan")}</span>
                      <span>{getString(locale, "hero.mock.dec")}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                      {getString(locale, "hero.mock.generate")}
                    </button>
                    <button className="flex-1 rounded-lg bg-slate-700/50 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors">
                      {getString(locale, "hero.mock.export")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
