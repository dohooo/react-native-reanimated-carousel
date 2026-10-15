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

/**
 * True on touch-first devices. There a finger on the phone should scroll the page
 * until the reader asks to use the scene.
 */
function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return coarse;
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
  const touch = useCoarsePointer();
  const [active, setActive] = useState(false);
  const fullScreen = `${process.env.DEMO_APP_URL}/demos/scenes/${slug}/demo`;

  return (
    <div className="rnrc-scene-host">
      <div className="rnrc-scene">
        <div className="rnrc-scene-phone" ref={phoneBox}>
          <ScenePhone
            slug={slug}
            bar={bar}
            width={phoneWidth}
            interactive={!touch || active}
            onActivate={() => setActive(true)}
            className={touch && active ? "rnrc-phone--active" : undefined}
          />
          {touch ? (
            <>
              <p className="rnrc-scene-hint">
                {active ? "Swipes on the phone now go to the scene." : "Tap the phone to try it."}
              </p>
              <div className="rnrc-scene-touch">
                <button
                  type="button"
                  className="rnrc-scene-button"
                  aria-pressed={active}
                  onClick={() => setActive((value) => !value)}
                >
                  {active ? "Done" : "Try it"}
                </button>
                <a className="rnrc-scene-button rnrc-scene-button--ghost" href={fullScreen}>
                  Full screen
                </a>
              </div>
            </>
          ) : (
            <p className="rnrc-scene-hint">Live demo. Drag it, tap it.</p>
          )}
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
    </div>
  );
}
