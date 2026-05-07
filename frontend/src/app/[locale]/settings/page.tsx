"use client";

import { useParams } from "next/navigation";
import { getString } from "@/lib/i18n";
import { useState } from "react";

const plans = [
	{
		name: "settings.basic",
		price: 29,
		features: [
			{ key: "100", text: "100 {credits}" },
			{ key: "basic", text: "Lead Finder Estándar" },
			{ key: "email", text: "Email Support" }
		],
		button: "settings.selectPlan",
		popular: false
	},
	{
		name: "settings.pro",
		price: 79,
		features: [
			{ key: "500", text: "500 {credits}" },
			{ key: "ai", text: "Advanced AI Insights" },
			{ key: "priority", text: "Priority Campaign Queues" },
			{ key: "crm", text: "CRM Integrations" }
		],
		button: "settings.currentPlan",
		popular: true
	},
	{
		name: "settings.enterprise",
		price: 249,
		features: [
			{ key: "unlimited", text: "Unlimited Credits" },
			{ key: "manager", text: "Dedicated Account Manager" },
			{ key: "api", text: "Custom API Access" }
		],
		button: "settings.contactSales",
		popular: false
	}
];

export default function SettingsPage() {
	const params = useParams<{ locale: string }>();
	const locale = params?.locale || "es";
	const [emailDigests, setEmailDigests] = useState(true);
	const [browserAlerts, setBrowserAlerts] = useState(false);

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900">{getString(locale, "settings.title")}</h1>
				<button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
					</svg>
					{getString(locale, "settings.saveChanges")}
				</button>
			</div>

			{/* Profile & Credits Row */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Profile Card */}
				<div className="flex items-start gap-6 rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
					<div className="relative">
						<div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300"></div>
						<div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
							<svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
					</div>
					<div className="flex-1">
						<h2 className="text-3xl font-bold text-gray-900">Alex Thompson</h2>
						<p className="text-gray-600">alex.thompson@authoritylead.ai</p>
						<div className="mt-3 flex items-center gap-3">
							<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
								PRO PLAN
							</span>
							<span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
								Member since Oct 2023
							</span>
						</div>
					</div>
				</div>

				{/* Credits Card */}
				<div className="rounded-xl bg-white p-6 shadow-sm">
					<p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{getString(locale, "settings.availableCredits")}</p>
					<div className="mt-2 flex items-baseline gap-1">
						<span className="text-4xl font-bold text-blue-600">35</span>
						<span className="text-lg text-gray-400">/50</span>
					</div>
					<p className="mt-1 text-xs text-gray-500">{getString(locale, "settings.resetsIn")} 12 {getString(locale, "settings.days")}</p>
					<div className="mt-3 h-2 w-full rounded-full bg-gray-100">
						<div className="h-full w-3/4 rounded-full bg-blue-600"></div>
					</div>
					<button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 py-2 text-sm font-semibold text-gray-900 hover:bg-emerald-500">
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
						{getString(locale, "settings.recharge")}
					</button>
				</div>
			</div>

			{/* Plans Section */}
			<div>
				<h2 className="mb-2 text-center text-xl font-semibold text-gray-900">{getString(locale, "settings.plans")}</h2>
				<p className="mb-6 text-center text-sm text-gray-600">{getString(locale, "settings.plansDesc")}</p>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					{plans.map((plan) => (
						<div
							key={plan.name}
							className={`relative rounded-2xl p-6 ${
								plan.popular
									? "bg-gradient-to-br from-slate-900 to-slate-800 text-white"
									: "bg-white shadow-sm"
							}`}
						>
							{plan.popular && (
								<span className="absolute right-4 top-4 rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-gray-900">
									{getString(locale, "settings.mostPopular")}
								</span>
							)}

							<h3 className={`text-lg font-semibold ${plan.popular ? "text-white" : "text-gray-900"}`}>
								{getString(locale, plan.name)}
							</h3>
							<div className="my-4">
								<span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
									${plan.price}
								</span>
								<span className={plan.popular ? "text-gray-400" : "text-gray-500"}>
									{getString(locale, "settings.perMonth")}
								</span>
							</div>

							<ul className="mb-6 space-y-3">
								{plan.features.map((feature) => (
									<li key={feature.key} className="flex items-center gap-2 text-sm">
										{plan.popular ? (
											<svg className="h-5 w-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										) : (
											<svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
										)}
										<span className={plan.popular ? "text-gray-300" : "text-gray-700"}>
											{feature.text.includes("{credits}") ?
												feature.text.replace("{credits}", getString(locale, "settings.creditsMonthly")) :
												getString(locale, feature.key) || feature.text
											}
										</span>
									</li>
								))}
								</ul>

								<button
									className={`w-full rounded-lg py-2.5 text-sm font-semibold ${
										plan.popular
											? "bg-emerald-400 text-gray-900 hover:bg-emerald-500"
											: "border border-gray-200 text-gray-700 hover:bg-gray-50"
									}`}
								>
									{getString(locale, plan.button)}
								</button>
							</div>
					))}
				</div>
			</div>

			{/* Personal Info & Security */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Personal Info */}
				<div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
					<div className="mb-6 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
							<svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900">{getString(locale, "settings.personalInfo")}</h3>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
								{getString(locale, "settings.fullName")}
							</label>
							<input
								type="text"
								defaultValue="Alex Thompson"
								className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
							/>
						</div>
						<div>
							<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
								{getString(locale, "settings.email")}
							</label>
							<input
								type="email"
								defaultValue="alex.thompson@authoritylead.ai"
								className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
							/>
						</div>
						<div>
							<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
								{getString(locale, "settings.jobTitle")}
							</label>
							<input
								type="text"
								defaultValue="Head of Growth"
								className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
							/>
						</div>
						<div>
							<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
								{getString(locale, "settings.company")}
							</label>
							<input
								type="text"
								defaultValue="Authority Intel Group"
								className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
							/>
						</div>
					</div>
				</div>

				{/* Security */}
				<div className="rounded-xl bg-gray-100 p-6">
					<div className="mb-4 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
							<svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900">{getString(locale, "settings.security")}</h3>
					</div>
					<p className="mb-4 text-sm text-gray-600">{getString(locale, "settings.securityDesc")}</p>
					<button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
						{getString(locale, "settings.changePassword")}
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>
			</div>

			{/* Notifications */}
			<div className="rounded-xl bg-white p-6 shadow-sm">
				<div className="mb-6 flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
						<svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900">{getString(locale, "settings.notifications")}</h3>
						<p className="text-sm text-gray-600">{getString(locale, "settings.notificationsDesc")}</p>
					</div>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-3">
							<span className="text-sm font-medium text-gray-700">{getString(locale, "settings.emailDigests")}</span>
							<button
								onClick={() => setEmailDigests(!emailDigests)}
								className={`relative h-6 w-11 rounded-full transition-colors ${emailDigests ? 'bg-blue-600' : 'bg-gray-200'}`}
							>
								<span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${emailDigests ? 'translate-x-5' : ''}`} />
							</button>
						</div>
						<div className="flex items-center gap-3">
							<span className="text-sm font-medium text-gray-700">{getString(locale, "settings.browserAlerts")}</span>
							<button
								onClick={() => setBrowserAlerts(!browserAlerts)}
								className={`relative h-6 w-11 rounded-full transition-colors ${browserAlerts ? 'bg-blue-600' : 'bg-gray-200'}`}
							>
								<span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${browserAlerts ? 'translate-x-5' : ''}`} />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
