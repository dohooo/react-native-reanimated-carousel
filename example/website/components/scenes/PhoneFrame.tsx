import React from "react";

/**
 * iPhone 17 Pro drawn at its real proportions.
 *
 * Screen: 402 x 874 pt, corner radius 62 pt, status bar 54 pt, Dynamic Island
 * 126 x 37 pt at y = 11, home indicator 134 x 5 pt, 8 pt above the bottom.
 * Body: 71.9 x 150.0 mm around a 66.6 x 144.8 mm panel (1206 x 2622 px at
 * 460 ppi), which is a 16 pt border on every side: 434 x 906 pt overall.
 */
export const SCREEN = { width: 402, height: 874, radius: 62 } as const;
export const DEVICE = { width: 434, height: 906, radius: 78, border: 16 } as const;

export type StatusBarStyle = "light" | "dark";

interface PhoneFrameProps {
  /** Rendered width of the device in CSS pixels. Height follows the real aspect ratio. */
  width: number;
  /** Colour of the status bar and home indicator: "light" on dark screens. */
  bar?: StatusBarStyle;
  /** Content of the 402 x 874 screen. */
  children: React.ReactNode;
  /** Draw only the screen (status bar, island and home indicator) without the body. */
  bare?: boolean;
  className?: string;
}

export function PhoneFrame({ width, bar = "dark", children, bare, className }: PhoneFrameProps) {
  if (bare) {
    const scale = width / SCREEN.width;
    return (
      <div
        className={`rnrc-phone rnrc-phone--bare ${className ?? ""}`}
        style={{ width, height: SCREEN.height * scale }}
      >
        <div className="rnrc-phone-screen" data-bar={bar} style={{ transform: `scale(${scale})` }}>
          {children}
          <StatusBar />
          <div className="rnrc-phone-island" />
          <div className="rnrc-phone-home" />
        </div>
      </div>
    );
  }
  const scale = width / DEVICE.width;
  return (
    <div
      className={`rnrc-phone ${className ?? ""}`}
      style={{ width, height: DEVICE.height * scale }}
    >
      <div className="rnrc-phone-device" style={{ transform: `scale(${scale})` }}>
        <div className="rnrc-phone-bezel" />
        <div className="rnrc-phone-screen" data-bar={bar}>
          {children}
          <StatusBar />
          <div className="rnrc-phone-island" />
          <div className="rnrc-phone-home" />
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="rnrc-phone-status" aria-hidden="true">
      <div className="rnrc-phone-time">9:41</div>
      <div className="rnrc-phone-icons">
        <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor">
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="1" />
          <rect x="5.1" y="5" width="3.2" height="7" rx="1" />
          <rect x="10.2" y="2.5" width="3.2" height="9.5" rx="1" />
          <rect x="15.3" y="0" width="3.2" height="12" rx="1" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <path d="M8.5 2.6c2.4 0 4.6.9 6.3 2.4.2.2.5.2.7 0l1.1-1.1c.2-.2.2-.5 0-.7C14.5 1.2 11.6 0 8.5 0S2.5 1.2.4 3.2c-.2.2-.2.5 0 .7l1.1 1.1c.2.2.5.2.7 0C3.9 3.5 6.1 2.6 8.5 2.6Z" />
          <path d="M8.5 6.4c1.3 0 2.5.5 3.5 1.3.2.2.5.2.7 0l1.1-1.1c.2-.2.2-.5 0-.7-1.4-1.2-3.3-2-5.3-2s-3.9.8-5.3 2c-.2.2-.2.5 0 .7l1.1 1.1c.2.2.5.2.7 0 1-.8 2.2-1.3 3.5-1.3Z" />
          <path d="M10.7 9.6c.2-.2.2-.5 0-.7-.6-.5-1.4-.8-2.2-.8s-1.6.3-2.2.8c-.2.2-.2.5 0 .7l1.9 1.9c.2.2.5.2.7 0l1.8-1.9Z" />
        </svg>
        <svg width="28" height="13" viewBox="0 0 28 13">
          <rect
            x="0.5"
            y="0.5"
            width="24"
            height="12"
            rx="3.8"
            fill="none"
            stroke="currentColor"
            strokeOpacity=".35"
          />
          <rect x="2" y="2" width="21" height="9" rx="2.5" fill="currentColor" />
          <path
            d="M26 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z"
            fill="currentColor"
            fillOpacity=".4"
          />
        </svg>
      </div>
    </div>
  );
}
