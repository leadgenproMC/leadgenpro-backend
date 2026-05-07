"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { getString } from "@/lib/i18n";
import { useState } from "react";

const sidebarItems = [
	{ key: "nav.dashboard", href: "/dashboard", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
	{ key: "nav.leadFinder", href: "/lead-finder", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
	{ key: "nav.campaigns", href: "/campaigns", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
	{ key: "nav.analytics", href: "/analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
	{ key: "nav.integration", href: "/integration", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
];

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const params = useParams<{ locale: string }>();
	const pathname = usePathname();
	const locale = params?.locale || "es";
	const [langOpen, setLangOpen] = useState(false);

	const switchLocale = (newLocale: string) => {
		const pathWithoutLocale = pathname.replace(`/${locale}`, "");
		return `/${newLocale}${pathWithoutLocale}`;
	};

	const isActive = (href: string) => pathname.includes(href);

	return (
		<div className="flex h-screen bg-gray-50">
			{/* Sidebar */}
			<aside className="flex w-64 flex-col bg-slate-950">
				{/* Logo */}
				<div className="flex items-center gap-3 p-6">
					<svg className="h-10 w-10 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					</svg>
					<div>
						<h1 className="text-xl font-bold text-white">LeadGen</h1>
						<span className="text-xs font-medium text-emerald-400">LEAD INTEL</span>
					</div>
				</div>

				{/* Nav Items */}
				<nav className="flex-1 px-4 py-4">
					{sidebarItems.map((item) => (
						<Link
							key={item.href}
							href={`/${locale}${item.href}`}
							className={`mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
								isActive(item.href)
									? "bg-emerald-500/10 text-emerald-400"
									: "text-gray-400 hover:bg-slate-900 hover:text-white"
							}`}
						>
							<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
							</svg>
							{getString(locale, item.key)}
						</Link>
					))}
				</nav>

				{/* Upgrade Button */}
				<div className="px-4 py-4">
					<Link
						href={`/${locale}/settings#plans`}
						className="flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-500"
					>
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
						{getString(locale, "nav.upgradePro")}
					</Link>
				</div>

				{/* Footer Links */}
				<div className="border-t border-slate-900 px-4 py-4">
					<Link
						href="#"
						className="mb-1 flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white"
					>
						<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						{getString(locale, "nav.helpCenter")}
					</Link>
					<Link
						href={`/${locale}/login`}
						className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white"
					>
						<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						{getString(locale, "nav.logout")}
					</Link>
				</div>
			</aside>

			{/* Main Content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Header */}
				<header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
					{/* Search */}
					<div className="flex items-center gap-4">
						<div className="relative">
							<svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							<input
								type="text"
								placeholder={getString(locale, "lead.search")}
								className="w-80 rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
							/>
						</div>
					</div>

					{/* Right Actions */}
					<div className="flex items-center gap-4">
						{/* Credits Badge */}
						<div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2">
							<svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
								<path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
							</svg>
							<span className="text-sm font-semibold text-blue-600">
								{getString(locale, "credits.available")}: 45
							</span>
						</div>

						{/* Generate Button */}
						<Link
							href={`/${locale}/lead-finder`}
							className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
						>
							{getString(locale, "nav.generate")}
						</Link>

						{/* Notifications */}
						<button className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
							<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
							</svg>
						</button>

						{/* Language Selector */}
						<div className="relative">
							<button
								onClick={() => setLangOpen(!langOpen)}
								className="flex items-center gap-1 rounded-lg p-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
							>
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
								</svg>
								<span className="uppercase">{locale}</span>
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{langOpen && (
								<div className="absolute right-0 mt-2 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50">
									<Link
										href={switchLocale("en")}
										className={`block px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
											locale === "en" ? "font-medium text-blue-600" : "text-gray-700"
										}`}
										onClick={() => setLangOpen(false)}
									>
										🇺🇸 English
									</Link>
									<Link
										href={switchLocale("es")}
										className={`block px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
											locale === "es" ? "font-medium text-blue-600" : "text-gray-700"
										}`}
										onClick={() => setLangOpen(false)}
									>
										🇪🇸 Español
									</Link>
								</div>
							)}
						</div>

						{/* Settings */}
						<Link
							href={`/${locale}/settings`}
							className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
						>
							<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</Link>

						{/* Avatar */}
						<div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-0.5">
							<div className="h-full w-full rounded-full bg-white p-0.5">
								<div className="h-full w-full rounded-full bg-gray-300" />
							</div>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-auto p-8">{children}</main>
			</div>
		</div>
	);
}
