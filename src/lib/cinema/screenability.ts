import type { Story } from "../types";

/**
 * SCREENABILITY is a community signal, not a prediction.
 * Weighted blend of reader behaviour and creator activity, expressed as a percentage.
 */
export function computeScreenability(s: { readers: number; likes: number; comments: number; saves: number; watchVotes: number; completion: number }, devProgress = 0): number {
  if (s.readers === 0) return 0;
  const watchRate = Math.min(1, s.watchVotes / Math.max(1, s.readers * 0.45));
  const likeRate = Math.min(1, s.likes / Math.max(1, s.readers * 0.8));
  const saveRate = Math.min(1, s.saves / Math.max(1, s.readers * 0.35));
  const talkRate = Math.min(1, s.comments / Math.max(1, s.readers * 0.12));
  const score = 0.38 * watchRate + 0.18 * likeRate + 0.14 * saveRate + 0.12 * talkRate + 0.12 * s.completion + 0.06 * devProgress;
  return Math.round(score * 100);
}

export function screenabilitySignals(story: Story) {
  const st = story.stats;
  return [
    { label: "Readers", value: st.readers },
    { label: "Likes", value: st.likes },
    { label: "Comments", value: st.comments },
    { label: "Watch votes", value: st.watchVotes },
    { label: "Saves", value: st.saves },
    { label: "Completion", value: Math.round(st.completion * 100), suffix: "%" },
  ];
}

export function watchShare(story: Story) {
  return Math.round((story.stats.watchVotes / Math.max(1, story.stats.watchVotes + story.stats.readers * 0.05)) * 100);
}
