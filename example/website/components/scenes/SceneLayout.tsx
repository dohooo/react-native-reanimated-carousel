import React, { useEffect, useRef, useState } from "react";

import type { StatusBarStyle } from "./PhoneFrame";
import { ScenePhone } from "./ScenePhone";

const GITHUB_DEMOS =
  "https://github.com/dohooo/react-native-reanimated-carousel/blob/main/example/app/app/demos/scenes";

/** Width of an element, kept up to date with a ResizeObserver. */
export function useElementWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.getBoundingClientRect().width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

interface SceneLayoutProps {
  slug: string;
  bar?: StatusBarStyle;
  children: React.ReactNode;
}

/** Scene page body: the live phone on the left, "How it works" and "Uses" on the right. */
export default function SceneLayout({ slug, bar = "dark", children }: SceneLayoutProps) {
  const [phoneBox, boxWidth] = useElementWidth<HTMLDivElement>(300);
  const phoneWidth = Math.min(300, Math.floor(boxWidth));

  return (
    <div className="rnrc-scene">
      <div className="rnrc-scene-phone" ref={phoneBox}>
        <ScenePhone slug={slug} bar={bar} width={phoneWidth} />
        <p className="rnrc-scene-hint">Live demo. Drag it, tap it.</p>
      </div>
      <div className="rnrc-scene-side">
        {children}
        <div className="rnrc-scene-actions">
          <a
            className="rnrc-scene-button"
            href={`${GITHUB_DEMOS}/${slug}/demo.tsx`}
            target="_blank"
            rel="noreferrer"
          >
            View source on GitHub
          </a>
          <a className="rnrc-scene-button rnrc-scene-button--ghost" href="/Examples/scenes">
            All scenes
          </a>
        </div>
      </div>
    </div>
  );
}
