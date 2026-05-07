import type { Lead } from "./types"

export async function fetchCredits(): Promise<number> {
	const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
	const res = await fetch(`${baseUrl}/credits/me`, {
		headers: {
			Authorization: "Bearer demo", // TODO: integrar Supabase auth
		},
		next: { revalidate: 0 },
	})
	if (!res.ok) throw new Error("Error obteniendo créditos")
	const data = await res.json()
	return data.credits ?? 0
}

export async function generateLeads(input: { niche: string; location: string; count: number }) {
	const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
	const res = await fetch(`${baseUrl}/leads/generate`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer demo",
		},
		body: JSON.stringify(input),
	})
	if (!res.ok) {
		const msg = await res.text()
		throw new Error(msg || "Error generando leads")
	}
	return res.json() as Promise<{ leads: Lead[]; requested: number; niche: string; location: string }>
}
