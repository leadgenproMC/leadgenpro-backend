"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { getString } from "@/lib/i18n";

export default function CampaignsPage() {
	const params = useParams<{ locale: string }>();
	const locale = params?.locale || "es";
	const [activeTemplate, setActiveTemplate] = useState<"direct" | "consultive">("direct");
	const [avoidWeekends, setAvoidWeekends] = useState(true);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">{getString(locale, "campaigns.title")}</h1>
				</div>
				<div className="flex gap-3">
					<button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
						</svg>
						{getString(locale, "campaigns.saveDraft")}
					</button>
					<button className="flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-gray-900 hover:bg-emerald-500">
						<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
							<path d="M8 5v14l11-7z"/>
						</svg>
						{getString(locale, "campaigns.activate")}
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Left Column - Config */}
				<div className="space-y-6 lg:col-span-2">
					{/* Config Header */}
					<div className="rounded-xl bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-gray-900">{getString(locale, "campaigns.config")}</h2>
						<p className="text-sm text-gray-600">{getString(locale, "campaigns.configDesc")}</p>
					</div>

					{/* Flow Section */}
					<div className="rounded-xl bg-white p-6 shadow-sm">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="font-semibold text-gray-900">{getString(locale, "campaigns.flow")}</h3>
							<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
								{getString(locale, "campaigns.sequenceActive")}
							</span>
						</div>

						{/* Email Steps */}
						<div className="space-y-4">
							{/* Email 1 */}
							<div className="rounded-lg border border-gray-200 p-4">
								<div className="mb-3 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
											<svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
											</svg>
										</div>
										<div>
											<p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{getString(locale, "campaigns.email.opening")}</p>
											<p className="font-medium text-gray-900">{getString(locale, "campaigns.email.openingTitle")}</p>
										</div>
									</div>
									<button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
										<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
										</svg>
									</button>
								</div>
								<p className="text-sm text-gray-600">
									&quot;{getString(locale, "campaigns.email.preview1")}&quot;
								</p>
							</div>

							{/* Wait Step */}
							<div className="flex justify-center py-2">
								<div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
									<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									{getString(locale, "campaigns.wait")}
								</div>
							</div>

							{/* Email 2 */}
							<div className="rounded-lg border border-gray-200 p-4">
								<div className="mb-3 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
											<svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
											</svg>
										</div>
										<div>
											<p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{getString(locale, "campaigns.email.followup")}</p>
											<p className="font-medium text-gray-900">{getString(locale, "campaigns.email.followupTitle")}</p>
										</div>
									</div>
									<button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
										<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
										</svg>
									</button>
								</div>
								<p className="text-sm text-gray-600">
									&quot;{getString(locale, "campaigns.email.preview2")}&quot;
								</p>
							</div>

							{/* Add Step Button */}
							<button className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600">
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
								</svg>
								{getString(locale, "campaigns.addStep")}
							</button>
						</div>
					</div>
				</div>

				{/* Right Column - Settings */}
				<div className="space-y-6">
					{/* Personalization */}
					<div className="rounded-xl bg-white p-6 shadow-sm">
						<div className="mb-4 flex items-center gap-2">
							<svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
							</svg>
							<h3 className="font-semibold text-gray-900">{getString(locale, "campaigns.personalization")}</h3>
						</div>
						<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "campaigns.variables")}</p>
						<div className="mb-4 flex flex-wrap gap-2">
							<span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">{'{Nombre}'}</span>
							<span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">{'{Nicho}'}</span>
							<span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">{'{Empresa}'}</span>
							<span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">{'{Ciudad}'}</span>
						</div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "campaigns.defaultValue")}</p>
						<input
							type="text"
							placeholder={getString(locale, "campaigns.placeholder.niche")}
							className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
						/>
					</div>

					{/* Schedule */}
					<div className="rounded-xl bg-white p-6 shadow-sm">
						<div className="mb-4 flex items-center gap-2">
							<svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							<h3 className="font-semibold text-gray-900">{getString(locale, "campaigns.schedule")}</h3>
						</div>

						<div className="mb-4 rounded-lg border border-gray-200 p-3">
							<div className="mb-2 flex items-center justify-between">
								<span className="text-sm font-medium text-gray-900">{getString(locale, "campaigns.sendWindow")}</span>
								<svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<p className="text-xs text-gray-500">{getString(locale, "campaigns.weekdays")}</p>
						</div>

						<div className="mb-4 grid grid-cols-2 gap-3">
							<div>
								<p className="mb-1 text-xs font-semibold uppercase text-gray-500">{getString(locale, "campaigns.from")}</p>
								<div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
									<span className="text-sm font-medium text-gray-900">09:00</span>
									<svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
							</div>
							<div>
								<p className="mb-1 text-xs font-semibold uppercase text-gray-500">{getString(locale, "campaigns.to")}</p>
								<div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
									<span className="text-sm font-medium text-gray-900">06:00</span>
									<span className="text-xs text-gray-500">P</span>
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-700">{getString(locale, "campaigns.avoidWeekends")}</span>
							<button
								onClick={() => setAvoidWeekends(!avoidWeekends)}
								className={`relative h-6 w-11 rounded-full transition-colors ${avoidWeekends ? 'bg-emerald-500' : 'bg-gray-200'}`}
							>
								<span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${avoidWeekends ? 'translate-x-5' : ''}`} />
							</button>
						</div>
					</div>

					{/* AI Templates */}
					<div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
						<div className="mb-3 flex items-center gap-2">
							<svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
							</svg>
							<p className="text-xs font-semibold uppercase tracking-wider text-blue-400">{getString(locale, "campaigns.exploreAll")}</p>
						</div>
						<h3 className="mb-2 text-lg font-semibold">{getString(locale, "campaigns.aiTemplates")}</h3>
						<p className="mb-4 text-sm text-gray-400">{getString(locale, "campaigns.aiTemplatesDesc")}</p>

						<div className="space-y-2">
							<button
								onClick={() => setActiveTemplate("direct")}
								className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
									activeTemplate === "direct" ? "bg-emerald-500 text-gray-900" : "bg-slate-700 text-white hover:bg-slate-600"
								}`}
							>
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
								{getString(locale, "campaigns.template1")}
							</button>
							<button
								onClick={() => setActiveTemplate("consultive")}
								className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
									activeTemplate === "consultive" ? "bg-emerald-500 text-gray-900" : "bg-slate-700 text-white hover:bg-slate-600"
								}`}
							>
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
								</svg>
								{getString(locale, "campaigns.template2")}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Stats Row */}
			<div className="grid grid-cols-4 gap-4">
				<div className="rounded-xl bg-white p-4 text-center shadow-sm">
					<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "campaigns.stats.delivery")}</p>
					<p className="text-2xl font-bold text-gray-900">98.4%</p>
					<span className="text-xs text-emerald-600">↗ +0.2%</span>
				</div>
				<div className="rounded-xl bg-white p-4 text-center shadow-sm">
					<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "campaigns.stats.openRate")}</p>
					<p className="text-2xl font-bold text-gray-900">42%</p>
					<span className="text-xs text-emerald-600">↗ {getString(locale, "campaigns.highIntent")}</span>
				</div>
				<div className="rounded-xl bg-white p-4 text-center shadow-sm">
					<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "campaigns.stats.responses")}</p>
					<p className="text-2xl font-bold text-gray-900">12-15</p>
					<span className="text-xs text-gray-500">{getString(locale, "campaigns.perWeek")}</span>
				</div>
				<div className="rounded-xl bg-white p-4 text-center shadow-sm">
					<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "campaigns.stats.botStatus")}</p>
					<p className="text-sm font-bold text-gray-900">{getString(locale, "campaigns.stats.ready")}</p>
					<span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
				</div>
			</div>
		</div>
	);
}
