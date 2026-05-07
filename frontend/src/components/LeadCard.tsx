import type { Lead } from "@/lib/types"

export default function LeadCard({ lead }: { lead: Lead }) {
	return (
		<div className="rounded border p-3">
			<div className="flex items-center justify-between">
				<p className="font-medium">{lead.name}</p>
				<span className="text-xs text-gray-500">{lead.source}</span>
			</div>
			{lead.address && <p className="text-sm text-gray-700">{lead.address}</p>}
			<div className="mt-1 text-sm">
				{lead.website && (
					<a href={lead.website} target="_blank" className="mr-3 text-blue-600 hover:underline">
						Web
					</a>
				)}
				{lead.phone && <span className="text-gray-700">{lead.phone}</span>}
			</div>
		</div>
	)
}
