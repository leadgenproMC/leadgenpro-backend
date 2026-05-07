"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { clsx } from "clsx";
import { generateLeads } from "@/lib/api";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { getString } from "@/lib/i18n";

type Props = {
	onResults: (leads: any[]) => void
	onLoadingChange?: (loading: boolean) => void
};

export default function LeadForm({ onResults, onLoadingChange }: Props) {
	const params = useParams<{ locale: string }>();
	const locale = params?.locale;
	const [niche, setNiche] = useState("");
	const [location, setLocation] = useState("");
	const [count, setCount] = useState(10);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		onLoadingChange?.(true);
		try {
			const res = await generateLeads({ niche, location, count });
			onResults(res.leads);
		} catch (err: any) {
			setError(err?.message || "Error generando leads");
		} finally {
			setLoading(false);
			onLoadingChange?.(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<Input
					label={getString(locale, "lead.form.niche")}
					type="text"
					required
					value={niche}
					onChange={(e) => setNiche(e.target.value)}
					placeholder="dentist, hairdresser, plumber..."
				/>
				<Input
					label={getString(locale, "lead.form.location")}
					type="text"
					required
					value={location}
					onChange={(e) => setLocation(e.target.value)}
					placeholder="Madrid, Buenos Aires..."
				/>
				<Input
					label={getString(locale, "lead.form.count")}
					type="number"
					min={1}
					max={100}
					value={count}
					onChange={(e) => setCount(parseInt(e.target.value || "1", 10))}
				/>
			</div>
			<div className="flex items-center justify-between">
				<Button type="submit" disabled={loading} className={clsx(loading && "opacity-70")}>
					{loading ? "..." : getString(locale, "lead.form.submit")}
				</Button>
				{error && <p className="text-sm text-red-600">{error}</p>}
			</div>
		</form>
	);
}
