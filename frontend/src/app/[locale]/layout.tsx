import type {ReactNode} from 'react'
import CookieConsentWrapper from '@/components/CookieConsentWrapper'
import ChatBot from '@/components/ChatBot'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
	return [{ locale: 'es' }, { locale: 'en' }]
}

export default async function LocaleLayout({
	children, params,
}: {children: ReactNode; params: Promise<{locale: string}>}) {
	await params
	return (
		<div className="min-h-screen bg-white" suppressHydrationWarning>
			{children}
			<CookieConsentWrapper />
			<ChatBot />
		</div>
	)
}
