import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/giris?error=yetkisiz", req.url));
    }

    if (
      path.startsWith("/isletme-paneli") &&
      token?.role !== "business_owner" &&
      token?.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/giris?error=yetkisiz", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/hesabim") || path.startsWith("/admin") || path.startsWith("/isletme-paneli")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/hesabim/:path*", "/admin/:path*", "/isletme-paneli/:path*"],
};
