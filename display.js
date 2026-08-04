const PROFILE_SCALE = Object.freeze({
  phone: 0.95,
  tablet: 1,
  desktop: 1,
  tv: 1.15,
});

export function detectDisplay(environment = window) {
  const width = environment.innerWidth;
  const height = environment.innerHeight;
  const coarsePointer =
    environment.matchMedia?.("(pointer: coarse)").matches ?? false;
  const hover = environment.matchMedia?.("(hover: hover)").matches ?? false;
  const detectedProfile =
    width <= 600
      ? "phone"
      : width <= 1024
        ? "tablet"
        : width >= 1600
          ? "tv"
          : "desktop";
  return {
    width,
    height,
    devicePixelRatio: environment.devicePixelRatio || 1,
    coarsePointer,
    hover,
    detectedProfile,
    serviceWorker: "serviceWorker" in environment.navigator,
    fullscreen: "fullscreenEnabled" in environment.document,
  };
}

export function resolveDisplay(config, detected) {
  const profile =
    config.deviceProfile === "auto"
      ? detected.detectedProfile
      : config.deviceProfile;
  return {
    profile,
    scale: config.fontScale * config.displayScale * PROFILE_SCALE[profile],
    widthPercent: config.contentWidthPercent,
  };
}

export function formatDisplaySummary(display) {
  const pointer = display.coarsePointer ? "coarse pointer" : "fine pointer";
  const hover = display.hover ? "hover" : "no hover";
  const features = [
    display.serviceWorker ? "offline cache" : null,
    display.fullscreen ? "fullscreen" : null,
  ].filter(Boolean);
  return `${display.width}×${display.height} CSS px · ${display.devicePixelRatio}× DPR · ${pointer} · ${hover} · detected ${display.detectedProfile}${features.length ? ` · ${features.join(", ")}` : ""}`;
}
