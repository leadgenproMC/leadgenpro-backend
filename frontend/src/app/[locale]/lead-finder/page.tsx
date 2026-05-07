"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { getString } from "@/lib/i18n";
import { generateLeads } from "@/lib/api";

import type { Lead } from "@/lib/types";

const mockLeads: Lead[] = [
	{ id: 1, name: "Skyline Architecture", website: "skyline-arch.com", niche: "Construcción", location: "Madrid, ES", status: "contacted", statusColor: "bg-emerald-500", source: "mock" },
	{ id: 2, name: "Vanguard Tech", website: "vanguard.io", niche: "Tecnología", location: "Barcelona, ES", status: "verified", statusColor: "bg-blue-500", source: "mock" },
	{ id: 3, name: "Organic Roots", website: "organicroots.com", niche: "Retail", location: "Valencia, ES", status: "rejected", statusColor: "bg-red-500", source: "mock" },
	{ id: 4, name: "Marbella Estates", website: "+34 952 00 11 22", niche: "Real Estate", location: "Málaga, ES", status: "verified", statusColor: "bg-emerald-500", source: "mock" },
];

export default function LeadFinderPage() {
	const params = useParams<{ locale: string }>();
	const locale = params?.locale || "es";
	const [niche, setNiche] = useState("");
	const [location, setLocation] = useState("");
	const [count, setCount] = useState(50);
	const [loading, setLoading] = useState(false);
	const [leads, setLeads] = useState(mockLeads);
	const [hasSearched, setHasSearched] = useState(false);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const results = await generateLeads({ niche, location, count });
			setLeads(results.leads);
			setHasSearched(true);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="text-center">
				<h1 className="text-3xl font-bold text-gray-900">
					{getString(locale, "lead.header.title")}
				</h1>
				<p className="mt-2 text-gray-600">
					{getString(locale, "lead.header.subtitle")}
				</p>
			</div>

			{/* Search Form */}
			<form onSubmit={handleSearch} className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-lg">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-4">
					{/* Niche */}
					<div>
						<label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
							{getString(locale, "lead.form.niche")}
						</label>
						<div className="relative">
							<svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
							<input
								type="text"
								value={niche}
								onChange={(e) => setNiche(e.target.value)}
								placeholder={locale === "es" ? "Ej. Dentista" : "E.g. Dentist"}
								className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
							/>
						</div>
					</div>

					{/* Location */}
					<div>
						<label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
							{getString(locale, "lead.form.location")}
						</label>
						<div className="relative">
							<svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							<input
								type="text"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								placeholder={locale === "es" ? "Ej. Madrid" : "E.g. Madrid"}
								className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
							/>
						</div>
					</div>

					{/* Count */}
					<div>
						<label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
							{getString(locale, "lead.form.count")}
						</label>
						<div className="relative">
							<select
								value={count}
								onChange={(e) => setCount(Number(e.target.value))}
								className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-10 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
							>
								<option value={50}>50 {getString(locale, "lead.results")}</option>
								<option value={100}>100 {getString(locale, "lead.results")}</option>
								<option value={200}>200 {getString(locale, "lead.results")}</option>
								<option value={500}>500 {getString(locale, "lead.results")}</option>
							</select>
							<svg className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
						</div>
					</div>

					{/* Submit Button */}
					<div className="flex items-end">
						<button
							type="submit"
							disabled={loading}
							className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 font-semibold text-gray-900 transition-all hover:bg-emerald-500 hover:shadow-lg disabled:opacity-50"
						>
							{loading ? (
								<svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
								</svg>
							) : (
								<>
									{getString(locale, "lead.form.submit")}
									<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
									</svg>
								</>
							)}
						</button>
					</div>
				</div>
			</form>

			{/* Empty State / Results */}
			{!hasSearched ? (
				<div className="mx-auto max-w-2xl text-center">
					{/* Illustration */}
					<div className="mx-auto mb-6 h-48 w-80 rounded-2xl bg-gradient-to-b from-gray-100 to-white p-8">
						<div className="flex h-full items-center justify-center">
							<svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
					</div>
					<h3 className="text-xl font-semibold text-gray-900">
						{getString(locale, "lead.empty.title")}
					</h3>
					<p className="mt-2 text-gray-600">
						{getString(locale, "lead.empty.desc")}
					</p>
					<div className="mt-8 flex justify-center gap-4">
						<div className="flex flex-col items-center gap-2">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
								<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<span className="text-xs font-semibold text-gray-900">{getString(locale, "lead.badge.verified")}</span>
						</div>
						<div className="flex flex-col items-center gap-2">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
								<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
							<span className="text-xs font-semibold text-gray-900">{getString(locale, "lead.badge.realtime")}</span>
						</div>
						<div className="flex flex-col items-center gap-2">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
								<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
								</svg>
							</div>
							<span className="text-xs font-semibold text-gray-900">{getString(locale, "lead.badge.ai")}</span>
						</div>
					</div>
				</div>
			) : (
				<div className="rounded-2xl bg-white p-6 shadow-lg">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h2 className="text-xl font-semibold text-gray-900">{getString(locale, "dashboard.leadManager")}</h2>
							<p className="text-sm text-gray-600">{getString(locale, "dashboard.leadManagerDesc")}</p>
						</div>
						<div className="flex gap-3">
							<button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
								</svg>
								{getString(locale, "lead.segment")}
							</button>
							<button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
								</svg>
								{getString(locale, "lead.exportCSV")}
							</button>
						</div>
					</div>

					{/* Leads Table */}
					<div className="overflow-hidden rounded-xl border border-gray-200">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "lead.table.business")}</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "lead.form.niche")}</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "lead.form.location")}</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "lead.table.status")}</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{leads.map((lead) => (
									<tr key={lead.id} className="hover:bg-gray-50">
										<td className="px-4 py-4">
											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-sm font-semibold text-blue-600">
													{lead.name.charAt(0)}
												</div>
												<div>
													<p className="font-medium text-gray-900">{lead.name}</p>
													<p className="text-sm text-gray-500">{lead.website}</p>
												</div>
											</div>
										</td>
										<td className="px-4 py-4">
											<span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
												{lead.niche}
											</span>
										</td>
										<td className="px-4 py-4">
											<div className="flex items-center gap-1 text-sm text-gray-600">
												<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
												{lead.location}
											</div>
										</td>
										<td className="px-4 py-4">
											<div className="flex items-center gap-2">
												<span className={`h-2.5 w-2.5 rounded-full ${lead.statusColor}`}></span>
												<span className="text-sm capitalize text-gray-700">{lead.status}</span>
											</div>
										</td>
									</tr>
								))}
								</tbody>
							</table>
						</div>
					</div>
				)}
		</div>
	);
}
