import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/app(.*)',
  '/admin(.*)',
  '/api(.*)',
])
// Clerk webhooks authenticate via svix signature, not a Clerk session,
// so they must stay reachable without auth.protect().
const isPublicApiRoute = createRouteMatcher(['/api/webhooks(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) && !isPublicApiRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}