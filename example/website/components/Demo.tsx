import React, { useEffect, useState } from "react";

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
  const pagePath = `/demos/${kind}/${name}`;

  const handleIframeLoad = () => {
    window.addEventListener("message", (event) => {
      if (
        event.data.type !== "carouselHeight" ||
        event.data.kind !== kind ||
        event.data.name !== name
      )
        return;

      setCarouselHeight(event.data.height);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.type === "reduceMotion")
        setReduceMotion(event.data.reduceMotion);
    });
  }, []);

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
              color: "white",
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
          onLoad={handleIframeLoad}
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
