import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Replays are session replays that capture videos of user sessions when errors occur.
  // This is highly recommended for production debugging.
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
