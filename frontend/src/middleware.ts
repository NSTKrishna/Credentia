import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Workaround: if the internal router-state header is malformed (often due to header-modifying
  // extensions/proxies), Next throws: "The router state header was sent but could not be parsed."
  // We try to decode/validate and if it's not plausible, we strip it to avoid a hard 500.
  const routerStateHeaderName = 'next-router-state-tree';
  const routerStateRaw = request.headers.get(routerStateHeaderName);
  if (routerStateRaw) {
    const parseJson = (value: string) => {
      try {
        return { ok: true as const, value: JSON.parse(value) };
      } catch {
        return { ok: false as const, value: null };
      }
    };

    let parsed: unknown | null = null;
    const direct = parseJson(routerStateRaw);
    if (direct.ok) {
      parsed = direct.value;
    } else {
      try {
        const decoded = decodeURIComponent(routerStateRaw);
        const decodedParsed = parseJson(decoded);
        if (decodedParsed.ok) {
          parsed = decodedParsed.value;
          const headers = new Headers(request.headers);
          headers.set(routerStateHeaderName, decoded);
          return NextResponse.next({ request: { headers } });
        }
      } catch {
        // ignore
      }
    }

    // Minimal sanity check: Next's router state is an array-based tree and should never be a tiny array.
    const looksLikeRouterState = Array.isArray(parsed) && parsed.length >= 2;
    if (!looksLikeRouterState) {
      const headers = new Headers(request.headers);
      headers.delete(routerStateHeaderName);
      return NextResponse.next({ request: { headers } });
    }
  }

  // Check for auth token in cookies (middleware cannot read localStorage)
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Protect dashboard-area routes
  if (path.startsWith('/dashboard') || path.startsWith('/candidates') || path.startsWith('/reports')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect from root or auth pages to dashboard if already authenticated
  if (path === '/' || path === '/login' || path === '/register') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/candidates/:path*', '/reports/:path*', '/login', '/register'],
};
