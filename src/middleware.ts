import { NextResponse, type NextRequest } from "next/server";

/** Members only beyond this point. Role checks happen server-side in the dashboard layout. */
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/dashboard") && !req.cookies.get("bc_session")?.value) {
    const url = req.nextUrl.clone(); url.pathname = "/login"; url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/dashboard/:path*"] };
