import type { Lead } from "@/lib/types"
import LeadCard from "@/components/LeadCard"

export default function LeadsList({ leads }: { leads: Lead[] }) {
	if (!leads?.length) return null
	return (
		<div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
			<h3 className="mb-3 text-sm font-semibold">Resultados ({leads.length})</h3>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{leads.map((l, idx) => (
					<LeadCard key={idx} lead={l} />
				))}
			</div>
		</div>
	)
}
