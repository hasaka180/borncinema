import type { AIImageProvider, AIVideoProvider } from "../types";
import { IMG } from "@/lib/data/images";
import { sleep } from "@/lib/utils";

const POOL = [IMG.tunnel, IMG.corridor, IMG.station, IMG.rain, IMG.nightCity, IMG.fogForest, IMG.windowLight, IMG.neon, IMG.hotel, IMG.bridge, IMG.desert, IMG.ocean];

export const mockImage: AIImageProvider = {
  name: "Placeholder stills (mock)",
  isMock: true,
  async generateStill(prompt, seed = 0) {
    await sleep(900 + Math.random() * 600);
    const h = prompt.split("").reduce((a, c) => a + c.charCodeAt(0), seed);
    return { url: POOL[h % POOL.length], isPlaceholder: true };
  },
};

export const mockVideo: AIVideoProvider = {
  name: "Animated storyboard (mock)",
  isMock: true,
  async generatePreview(frames) {
    await sleep(1600);
    return { status: "placeholder", frames, note: "No video provider configured. This preview animates your storyboard frames with camera motion so you can feel the cut. Connect AI_VIDEO_PROVIDER to render real footage." };
  },
};
