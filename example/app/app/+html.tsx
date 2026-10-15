import { WebProvider } from "@/store/WebProvider";
import Head from "expo-router/head";
import { ScrollViewStyleReset } from "expo-router/html";

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1"
        />

        <Head>
          <title>Examples - RNRC</title>
        </Head>

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Touch handling for demos embedded in the docs; see the script below. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-page-scroll="y"] { touch-action: pan-y !important; }
              [data-page-scroll="x"] { touch-action: pan-x !important; }
            `,
          }}
        />

        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              if (!window.location.search.includes("in_doc=true")) {
                return;
              }

              // Tell the docs page how tall the demo is. The page can hydrate after this
              // document has loaded, so it may also ask again with "requestCarouselHeight".
              const postHeight = () => {
                const carouselComponent = document.getElementById("carousel-component");
                if (!carouselComponent || window.parent === window) {
                  return;
                }
                window.parent.postMessage(
                  {
                    type: "carouselHeight",
                    height: carouselComponent.offsetHeight,
                    kind: carouselComponent.getAttribute("data-kind"),
                    name: carouselComponent.getAttribute("data-name"),
                  },
                  "*",
                );
              };
              window.addEventListener("load", postHeight);
              window.addEventListener("message", (event) => {
                if (event.data && event.data.type === "requestCarouselHeight") {
                  postHeight();
                }
              });

              // A carousel embedded in the docs only claims swipes along its own axis, so a
              // vertical swipe over a horizontal demo still scrolls the page on a phone.
              // Scenes in the iPhone frame keep every touch: the docs page decides when.
              if (window.location.search.includes("frame=iphone")) {
                return;
              }
              const markPageScroll = () => {
                const views = document.querySelectorAll(
                  '[data-testid="carousel-content-container"]:not([data-page-scroll])',
                );
                for (const view of views) {
                  const vertical = getComputedStyle(view).flexDirection.startsWith("column");
                  view.setAttribute("data-page-scroll", vertical ? "x" : "y");
                }
              };
              window.addEventListener("load", () => {
                markPageScroll();
                new MutationObserver(markPageScroll).observe(document.body, {
                  childList: true,
                  subtree: true,
                });
              });
            })();
          `,
        }}
      />
      <body>
        <WebProvider>{children}</WebProvider>
      </body>
    </html>
  );
}
