import "../styles.css";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import Script from "next/script";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (typeof window !== "undefined" && posthogKey) {
  // checks that we are client-side
  posthog.init(posthogKey, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug(); // debug mode in development
    },
  });
}

export default function MyApp({
  Component,
  pageProps: { session: _session, ...pageProps },
}) {
  const page = <Component {...pageProps} />;

  return (
    <>
      {/* Google AdSense Script */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2209220476314227"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      
      {posthogKey ? <PostHogProvider client={posthog}>{page}</PostHogProvider> : page}
    </>
  );
}
