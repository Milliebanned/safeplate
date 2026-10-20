import { NextResponse, type NextRequest } from "next/server";

// Fast redirect for signed-out visitors, keeping the page they asked for.
// The real session check happens on the server in every dashboard page and action.
export function proxy(request: NextRequest) {
  if (!request.cookies.has("sp_session")) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
