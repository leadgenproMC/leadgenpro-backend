"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import LeadsList from "@/components/LeadsList";
import { getString } from "@/lib/i18n";

export default function DashboardPage() {
	const params = useParams<{ locale: string }>();
	const locale = params?.locale;
	const [leads, setLeads] = useState<any[]>([]);
	return (
		<main>
			<h2 className="mb-4 text-xl font-semibold">{getString(locale, "nav.generate")}</h2>
			<LeadForm onResults={setLeads} />
			<LeadsList leads={leads} />
		</main>
	);
}
