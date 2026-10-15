import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { PhoneFrame, type StatusBarStyle } from "./PhoneFrame";
import { useElementWidth } from "./SceneLayout";
import data from "./scenes.json";

type Scene = (typeof data.scenes)[number];

/** Recording of a scene, sized to the 402 x 874 screen it was captured from. */
export function SceneVideo({ slug, title, autoPlay = false }: { slug: string; title: string; autoPlay?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (autoPlay && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.current?.pause();
    }
  }, [autoPlay]);
  const play = () => {
    const v = video.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => {});
  };
  const stop = () => {
    const v = video.current;
    if (!v || autoPlay) return;
    v.pause();
    v.currentTime = 0;
  };
  return (
    <div className="rnrc-phone-fill" onMouseEnter={play} onMouseLeave={stop}>
      <video
        className="rnrc-phone-fill"
        ref={video}
        src={`/scenes/${slug}.mp4`}
        poster={`/scenes/${slug}.jpg`}
        muted
        loop
        playsInline
        autoPlay={autoPlay}
        preload={autoPlay ? "auto" : "none"}
        aria-label={`${title} recording`}
      />
    </div>
  );
}

function SceneCard({ scene }: { scene: Scene }) {
  const [media, width] = useElementWidth<HTMLDivElement>(180);
  return (
    <Link href={`/Examples/scenes/${scene.slug}`} className="rnrc-card">
      <div className="rnrc-card-media" ref={media}>
        <PhoneFrame bare width={Math.round(width * 0.78)} bar={scene.statusBar as StatusBarStyle}>
          <SceneVideo slug={scene.slug} title={scene.title} />
        </PhoneFrame>
      </div>
      <div className="rnrc-card-body">
        <div className="rnrc-card-title">{scene.title}</div>
        <div className="rnrc-card-text">{scene.description}</div>
        <div className="rnrc-card-group">{scene.group}</div>
      </div>
    </Link>
  );
}

/** Filterable grid of every scene; each filter names the API behind it. */
export default function ScenesGallery() {
  const [tag, setTag] = useState<string>("all");
  const scenes = data.scenes;
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of data.tags) map[t.k] = scenes.filter((s) => s.tags.includes(t.k)).length;
    return map;
  }, [scenes]);
  const visible = tag === "all" ? scenes : scenes.filter((s) => s.tags.includes(tag));
  const active = data.tags.find((t) => t.k === tag);

  return (
    <div className="rnrc-gallery">
      <div className="rnrc-chips" role="group" aria-label="Filter scenes by capability">
        <button type="button" className="rnrc-chip" aria-pressed={tag === "all"} onClick={() => setTag("all")}>
          All <span>{scenes.length}</span>
        </button>
        {data.tags
          .filter((t) => counts[t.k] > 0)
          .map((t) => (
            <button
              key={t.k}
              type="button"
              className="rnrc-chip"
              aria-pressed={tag === t.k}
              onClick={() => setTag(t.k)}
            >
              {t.label} <span>{counts[t.k]}</span>
            </button>
          ))}
      </div>
      <p className="rnrc-api-line" aria-live="polite">
        {active ? (
          <>
            <b>{active.label}:</b> {active.api}
          </>
        ) : (
          `${scenes.length} scenes. Pick a capability to see which API it comes from.`
        )}
      </p>
      <div className="rnrc-grid">
        {visible.map((scene) => (
          <SceneCard key={scene.slug} scene={scene} />
        ))}
      </div>
    </div>
  );
}
