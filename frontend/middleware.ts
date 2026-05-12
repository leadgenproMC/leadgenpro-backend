import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { defaultLocale } from "./i18n"

const SUPPORTED_LOCALES = ["es", "en"] as const

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl

	// Solo manejar el caso específico de root y rutas sin locale
	if (pathname === "/") {
		return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url))
	}

	// Para rutas específicas que no empiezan con locale, solo redirigir si no son archivos estáticos
	const firstSegment = pathname.split("/")[1]
	if (firstSegment && !SUPPORTED_LOCALES.includes(firstSegment)) {
		// Verificar si es una ruta de la API o archivo estático
		if (firstSegment.startsWith("_") || firstSegment.includes(".")) {
			return NextResponse.next()
		}
		
		// Solo redirigir rutas de páginas
		const pageRoutes = ["login", "register", "dashboard", "verify-email", "verify-otp"]
		if (pageRoutes.includes(firstSegment)) {
			return NextResponse.redirect(new URL(`/${defaultLocale}/${firstSegment}${pathname.substring(pathname.indexOf(firstSegment) + firstSegment.length)}`, req.url))
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/((?!_next|.*\\..*).*)"],
}
