"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getString } from "@/lib/i18n";

export default function CTASection() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || "es";

  return (
    <section className="mx-4 my-8 rounded-3xl bg-slate-900 px-6 py-16 sm:mx-6 lg:mx-8 lg:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          {getString(locale, "cta.title.part1")}{" "}
          <span className="text-emerald-400">{getString(locale, "cta.title.highlight")}</span>{" "}
          {getString(locale, "cta.title.part2")}
        </h2>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-8 py-3.5 text-base font-medium text-slate-900 transition-all hover:bg-emerald-500 hover:shadow-lg"
          >
            {getString(locale, "cta.button.primary")}
          </Link>
          <button className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-800/50 px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-slate-800 hover:border-slate-500">
            {getString(locale, "cta.button.secondary")}
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          {getString(locale, "cta.footer")}
        </p>
      </div>
    </section>
  );
}
