import { openaiText, getAIStatus } from "./providers/openai-text";
import { mockImage, mockVideo } from "./providers/mock-media";
import type { AIImageProvider, AITextProvider, AIVideoProvider } from "./types";

/**
 * Provider registry.
 * Text: OpenAI through /api/ai when OPENAI_API_KEY is set on the server; otherwise the local partner.
 * Image / video: placeholder providers until a real one is connected (same contract).
 */
export const AI_TEXT_PROVIDER: AITextProvider = openaiText;
export const AI_IMAGE_PROVIDER: AIImageProvider = mockImage;
export const AI_VIDEO_PROVIDER: AIVideoProvider = mockVideo;

export const ai = { text: AI_TEXT_PROVIDER, image: AI_IMAGE_PROVIDER, video: AI_VIDEO_PROVIDER };
export { getAIStatus };
export * from "./types";
