"use client";

import { useParams } from "next/navigation";
import { getString } from "@/lib/i18n";

const campaignData = [
	{ name: "Tech Founders Q4 Outreach", days: 12, contacts: 850, opens: "62%", clicks: 124, status: "verified", statusColor: "bg-emerald-500" },
	{ name: "SaaS Growth Partners", days: 5, contacts: 434, opens: "78%", clicks: 89, status: "high-intent", statusColor: "bg-blue-500" },
	{ name: "E-commerce Retention Bot", days: 0, contacts: 1200, opens: "45%", clicks: 210, status: "paused", statusColor: "bg-gray-400" },
];

export default function AnalyticsPage() {
	const params = useParams<{ locale: string }>();
	const locale = params?.locale || "es";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900">{getString(locale, "analytics.title")}</h1>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						{getString(locale, "analytics.lastDays")}: 01 Oct - 30 Oct
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</div>
					<button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
						{getString(locale, "analytics.generateReport")}
					</button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				{/* ROI */}
				<div className="rounded-xl bg-white p-5 shadow-sm">
					<div className="mb-2 flex items-center justify-between">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
							<svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						</div>
						<span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">+12.5%</span>
					</div>
					<p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "analytics.roi")}</p>
					<p className="text-2xl font-bold text-gray-900">345%</p>
				</div>

				{/* Response Rate */}
				<div className="rounded-xl bg-white p-5 shadow-sm">
					<div className="mb-2 flex items-center justify-between">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
							<svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
							</svg>
						</div>
						<span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">+4.2%</span>
					</div>
					<p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "analytics.responseRate")}</p>
					<p className="text-2xl font-bold text-gray-900">18.7%</p>
				</div>

				{/* Open Rate */}
				<div className="rounded-xl bg-white p-5 shadow-sm">
					<div className="mb-2 flex items-center justify-between">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
							<svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
						</div>
						<span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">-1.8%</span>
					</div>
					<p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "analytics.openRate")}</p>
					<p className="text-2xl font-bold text-gray-900">64.2%</p>
				</div>

				{/* Leads Contacted */}
				<div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm">
					<div className="mb-2 flex items-center justify-between">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
							<svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
							</svg>
						</div>
						<span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-400">{getString(locale, "analytics.targetPercent")} 85%</span>
					</div>
					<p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{getString(locale, "analytics.leadsContacted")}</p>
					<p className="text-3xl font-bold">1,284</p>
				</div>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Campaign Performance */}
				<div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-gray-900">{getString(locale, "analytics.campaignPerformance")}</h3>
						<p className="text-sm text-gray-600">{getString(locale, "analytics.performanceDesc")}</p>
					</div>

					{/* Chart Legend */}
					<div className="mb-4 flex gap-4">
						<div className="flex items-center gap-2">
							<span className="h-3 w-3 rounded-full bg-blue-600"></span>
							<span className="text-sm text-gray-600">{getString(locale, "analytics.chart.opens")}</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="h-3 w-3 rounded-full bg-emerald-400"></span>
							<span className="text-sm text-gray-600">{getString(locale, "analytics.chart.conversions")}</span>
						</div>
					</div>

					{/* Bar Chart */}
					<div className="flex h-48 items-end justify-between gap-3">
						{["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map((day, i) => (
							<div key={day} className="flex flex-1 flex-col items-center gap-2">
								<div className="relative w-full">
									<div
										className="w-full rounded-t-lg bg-blue-200"
										style={{ height: `${[60, 80, 70, 90, 75, 50, 40][i]}px` }}
									/>
									<div
										className="absolute bottom-0 w-full rounded-t-lg bg-emerald-400"
										style={{ height: `${[20, 35, 45, 60, 30, 15, 10][i]}px` }}
									/>
								</div>
								<span className="text-xs text-gray-500">{day}</span>
							</div>
						))}
					</div>
				</div>

				{/* Funnel Health */}
				<div className="rounded-xl bg-white p-6 shadow-sm">
					<h3 className="mb-4 text-lg font-semibold text-gray-900">{getString(locale, "analytics.funnelHealth")}</h3>

					{/* Circular Progress */}
					<div className="relative mx-auto mb-4 h-40 w-40">
						<svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
							<circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
							<circle
								cx="50"
								cy="50"
								r="40"
								fill="none"
								stroke="#2563eb"
								strokeWidth="8"
								strokeDasharray="251.2"
								strokeDashoffset="62.8"
								strokeLinecap="round"
							/>
						</svg>
						<div className="absolute inset-0 flex flex-col items-center justify-center">
							<span className="text-3xl font-bold text-gray-900">75%</span>
							<span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "analytics.optimized")}</span>
						</div>
					</div>

					<p className="mb-4 text-center text-sm text-gray-600">
						{getString(locale, "analytics.conversionAbove")}
					</p>

					<button className="flex w-full items-center justify-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
						{getString(locale, "analytics.aiSuggestions")}
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 8V3h-5" />
						</svg>
					</button>
				</div>
			</div>

			{/* Campaign Breakdown */}
			<div className="rounded-xl bg-white p-6 shadow-sm">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-gray-900">{getString(locale, "analytics.campaignBreakdown")}</h3>
					<button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
						</svg>
						{getString(locale, "analytics.filterResults")}
					</button>
				</div>

				{/* Table Header */}
				<div className="mb-2 grid grid-cols-6 gap-4 border-b border-gray-200 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
					<div>{getString(locale, "analytics.campaignName")}</div>
					<div>{getString(locale, "analytics.contacts")}</div>
					<div>{getString(locale, "analytics.opens")}</div>
					<div>{getString(locale, "analytics.clicks")}</div>
					<div>{getString(locale, "analytics.leadStatus")}</div>
					<div>{getString(locale, "analytics.actions")}</div>
				</div>

				{/* Campaign Rows */}
				{campaignData.map((campaign, i) => (
					<div key={i} className="grid grid-cols-6 gap-4 border-b border-gray-100 py-4 last:border-0">
						<div>
							<p className="font-medium text-gray-900">{campaign.name}</p>
							<p className="text-xs text-gray-500">
								{campaign.days > 0 ? `${getString(locale, "analytics.started")} ${campaign.days} ${getString(locale, "analytics.daysAgo")}` : getString(locale, "analytics.paused")}
							</p>
						</div>
						<div className="flex items-center text-gray-900">{campaign.contacts}</div>
						<div className="flex items-center">
							<div className="h-2 w-16 rounded-full bg-gray-200">
								<div
									className="h-full rounded-full bg-blue-600"
									style={{ width: campaign.opens }}
								/>
							</div>
							<span className="ml-2 text-sm text-gray-700">{campaign.opens}</span>
						</div>
						<div className="flex items-center text-gray-900">{campaign.clicks}</div>
						<div className="flex items-center">
							<span className={`rounded-full px-2 py-1 text-xs font-semibold ${
								campaign.status === "verified" ? "bg-emerald-100 text-emerald-700" :
								campaign.status === "high-intent" ? "bg-blue-100 text-blue-700" :
								"bg-gray-100 text-gray-700"
							}`}>
								{campaign.status.toUpperCase()}
							</span>
						</div>
						<div className="flex items-center justify-end">
							<button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
								</svg>
							</button>
							<button className="ml-2 rounded-full bg-emerald-400 p-2 text-gray-900 hover:bg-emerald-500">
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
								</svg>
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
