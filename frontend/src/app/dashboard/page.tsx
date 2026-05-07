"use client";

import { useState } from "react";
import LeadForm from "@/components/LeadForm";
import LeadsList from "@/components/LeadsList";

export default function DashboardPage() {
	const [leads, setLeads] = useState<any[]>([]);
	return (
		<main>
			<h2 className="mb-4 text-xl font-semibold">Dashboard</h2>
			<LeadForm onResults={setLeads} />
			<LeadsList leads={leads} />
		</main>
	);
}
