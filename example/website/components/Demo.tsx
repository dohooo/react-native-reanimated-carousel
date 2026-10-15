import React, { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { Callout } from "nextra/components";

interface ResizableIframeProps {
  kind: string;
  name: string;
}

const IS_DEV = process.env.NODE_ENV === "development";

const ResizableIframe: React.FC<ResizableIframeProps> = ({ kind, name }) => {
  const [carouselHeight, setCarouselHeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pagePath = `/demos/${kind}/${name}`;

  // The demo can finish loading before this page hydrates, and then its first height
  // message is gone. Listen from mount and ask again on mount and on load.
  const requestHeight = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: "requestCarouselHeight" }, "*");
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === "reduceMotion") setReduceMotion(data.reduceMotion);
      if (data?.type !== "carouselHeight" || data.kind !== kind || data.name !== name) return;
      setCarouselHeight(data.height);
      setIsLoading(false);
    };
    window.addEventListener("message", onMessage);
    requestHeight();
    return () => window.removeEventListener("message", onMessage);
  }, [kind, name]);

  return (
    <div>
      <div
        style={{
          marginTop: "24px",
          width: "100%",
          height: carouselHeight ?? (IS_DEV ? 46 : 28),
          position: "relative",
          overflow: "hidden",
          transition: "height 0.3s ease-in-out",
        }}
      >
        {isLoading && (
          <div
            style={{
              textAlign: "center",
              opacity: 0.5,
              fontSize: 14,
            }}
          >
            Loading...
            <br />
            {IS_DEV && (
              <p style={{ fontSize: 12 }}>
                (Please make sure you have started the example app with
                &apos;yarn web&apos; and running on 8002 port)
              </p>
            )}
          </div>
        )}
        <iframe
          id="carousel-iframe"
          ref={iframeRef}
          title={`${name} demo`}
          onLoad={requestHeight}
          src={`${process.env.DEMO_APP_URL}${pagePath}/demo?in_doc=true`}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            overflow: "hidden",
            opacity: isLoading ? 0 : 1,
          }}
        ></iframe>
      </div>
      {reduceMotion && (
        <Callout type="warning">
          It looks like reduced motion is turned on in your system preferences.
          Some of the animations may be skipped.{" "}
          <Link
            target="_blank"
            style={{ textDecorationLine: "underline" }}
            href={
              "https://docs.swmansion.com/react-native-reanimated/docs/guides/accessibility/#reduced-motion-in-animations"
            }
          >
            Learn more
          </Link>
        </Callout>
      )}
    </div>
  );
};

export default ResizableIframe;
