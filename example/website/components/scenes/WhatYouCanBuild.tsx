import Link from "next/link";
import React from "react";

import { PhoneFrame, type StatusBarStyle } from "./PhoneFrame";
import { useElementWidth } from "./SceneLayout";
import { SceneVideo } from "./ScenesGallery";
import data from "./scenes.json";

const FEATURED = ["flavor-switcher", "stories-cube", "date-wheel", "map-explorer"];

/** Home page strip: four scenes recorded in an iPhone frame, linking to the Scenes gallery. */
export default function WhatYouCanBuild() {
  const [row, rowWidth] = useElementWidth<HTMLDivElement>(640);
  const columns = rowWidth < 520 ? 2 : 4;
  const gap = columns === 2 ? 20 : 16;
  const phoneWidth = Math.floor(Math.min(170, (rowWidth - gap * (columns - 1)) / columns));
  const scenes = FEATURED.map((slug) => data.scenes.find((s) => s.slug === slug)).filter(
    (s): s is (typeof data.scenes)[number] => !!s
  );

  return (
    <section className="rnrc-build" aria-labelledby="what-you-can-build">
      <h2 id="what-you-can-build" className="rnrc-build-title">
        What you can build
      </h2>
      <p className="rnrc-build-lede">
        Each screen below is a full app screen built on <code>{"<Carousel>"}</code>. Open one to drag
        it live and copy the code.
      </p>
      <div
        className="rnrc-build-row"
        ref={row}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap }}
      >
        {scenes.map((scene) => (
          <Link key={scene.slug} href={`/Examples/scenes/${scene.slug}`} className="rnrc-build-item">
            <PhoneFrame width={phoneWidth} bar={scene.statusBar as StatusBarStyle}>
              <SceneVideo slug={scene.slug} title={scene.title} autoPlay />
            </PhoneFrame>
            <span className="rnrc-build-name">{scene.title}</span>
            <span className="rnrc-build-group">{scene.group}</span>
          </Link>
        ))}
      </div>
      <Link className="rnrc-build-more" href="/Examples/scenes">
        Browse all {data.scenes.length} scenes →
      </Link>
    </section>
  );
}
