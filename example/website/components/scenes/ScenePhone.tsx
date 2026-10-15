import React, { useEffect, useState } from "react";

import { PhoneFrame, SCREEN, type StatusBarStyle } from "./PhoneFrame";

interface ScenePhoneProps {
  slug: string;
  bar?: StatusBarStyle;
  width: number;
  /**
   * When false, touches go to the page instead of the scene, so a finger that
   * lands on the phone still scrolls. Tapping the screen calls `onActivate`.
   */
  interactive?: boolean;
  onActivate?: () => void;
  className?: string;
}

/**
 * A live scene from the example app inside the iPhone frame. The iframe is
 * exactly 402 x 874 CSS px (the phone's screen in points) and the frame scales
 * it, so the scene lays out as it would on the device. The poster stays visible
 * until the scene reports that its fonts and first frame are ready.
 */
export function ScenePhone({
  slug,
  bar = "dark",
  width,
  interactive = true,
  onActivate,
  className,
}: ScenePhoneProps) {
  const [ready, setReady] = useState(false);
  const src = `${process.env.DEMO_APP_URL}/demos/scenes/${slug}/demo?in_doc=true&frame=iphone`;

  useEffect(() => {
    setReady(false);
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === "sceneReady" && typeof data.path === "string" && data.path.includes(`/scenes/${slug}/`)) {
        setReady(true);
      }
    };
    // No timeout fallback: if the scene never reports ready (offline, or the demo app
    // is still deploying), the poster is a better thing to show than a blank frame.
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [slug]);

  return (
    <PhoneFrame width={width} bar={bar} className={className}>
      <img className="rnrc-phone-fill" src={`/scenes/${slug}.jpg`} alt="" aria-hidden="true" />
      <iframe
        key={slug}
        className="rnrc-phone-fill"
        title={`${slug} scene`}
        src={src}
        width={SCREEN.width}
        height={SCREEN.height}
        style={{ opacity: ready ? 1 : 0, pointerEvents: interactive ? "auto" : "none" }}
      />
      {interactive ? null : (
        <button type="button" className="rnrc-phone-fill rnrc-phone-cover" onClick={onActivate}>
          <span className="rnrc-sr-only">Try the live scene</span>
        </button>
      )}
    </PhoneFrame>
  );
}
