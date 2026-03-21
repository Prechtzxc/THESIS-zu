import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Get the session token
  const token = await getToken({ req: request })

  // Allow public routes
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    if (token) {
      // Redirect authenticated users away from auth pages
      if (pathname === "/login" || pathname === "/register") {
        const redirectPath = token.role === "admin" ? "/admin/dashboard" : "/student/dashboard"
        return NextResponse.redirect(new URL(redirectPath, request.url))
      }
    }
    return NextResponse.next()
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (token.role !== "admin" && token.role !== "staff") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url))
    }
  }

  // Protect student routes
  if (pathname.startsWith("/student")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (token.role !== "student") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

// Limit middleware to only run on these paths
export const config = {
  matcher: ["/", "/student/:path*", "/admin/:path*", "/login", "/register"],
}
