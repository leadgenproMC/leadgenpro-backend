"use client";

import { useEffect, useState } from "react";
import { fetchCredits } from "@/lib/api";

export default function SettingsPage() {
	const [credits, setCredits] = useState<number | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const c = await fetchCredits();
				setCredits(c);
			} catch {
				setCredits(null);
			}
		})();
	}, []);

	return (
		<main>
			<h2 className="mb-4 text-xl font-semibold">Configuración</h2>
			<div className="rounded-lg border bg-white p-4 shadow-sm">
				<p className="text-sm">
					Créditos de leads restantes: <span className="font-medium">{credits ?? "-"}</span>
				</p>
			</div>
		</main>
	);
}
