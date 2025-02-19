import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';

// Define protected routes for each user type
const protectedRoutes = {
  talent: ['/talent'],
  recruiter: ['/recruiter'],
};

const publicRoutes = ['/', '/sign-in', '/sign-up', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next();

  try {
    const parsed = await verifyToken(sessionCookie.value);
    const userType = parsed.user.userType;
    const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update session token
    res.cookies.set({
      name: 'session',
      value: await signToken({
        ...parsed,
        expires: expiresInOneDay.toISOString(),
      }),
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: expiresInOneDay,
    });

    // Check if user is accessing their allowed routes
    const isTalentRoute = pathname.startsWith('/talent');
    const isRecruiterRoute = pathname.startsWith('/recruiter');

    if (
      (isTalentRoute && userType !== 'talent') ||
      (isRecruiterRoute && userType !== 'recruiter')
    ) {
      // Redirect to appropriate dashboard
      return NextResponse.redirect(
        new URL(`/${userType}`, request.url)
      );
    }

  } catch (error) {
    console.error('Error updating session:', error);
    res.cookies.delete('session');
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
