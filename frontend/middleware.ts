import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { defaultLocale } from "./i18n"

const SUPPORTED_LOCALES = ["es", "en"] as const

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl

	// Root: / -> /es (o locale por defecto)
	if (pathname === "/") {
		return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url))
	}

	// Si el primer segmento no es un locale soportado, forzamos el locale por defecto.
	const firstSegment = pathname.split("/").filter(Boolean)[0]
	if (firstSegment && !SUPPORTED_LOCALES.includes(firstSegment as any)) {
		return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, req.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/((?!_next|.*\\..*).*)"],
}
