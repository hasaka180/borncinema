/**
 * Hand-drawn line-art characters, one per stage of the platform.
 * Each is a set of stroked paths (no fills) so they can draw themselves on.
 * viewBox 0 0 240 300. Stroke colour follows currentColor.
 */
const P = (d: string, extra: Record<string, string | number> = {}) => (
  <path d={d} pathLength={1} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" {...extra} />
);

const head = (cx: number, cy: number) => (
  <>
    {P(`M ${cx - 24} ${cy} c 0 -30 48 -30 48 0 c 0 28 -48 28 -48 0 z`)}
    {P(`M ${cx - 20} ${cy - 16} c 10 -14 30 -14 40 -2 c -6 -6 -14 -6 -18 -2 c -6 -8 -16 -6 -22 4 z`)}
  </>
);
const face = (cx: number, cy: number, smile = true) => (
  <>
    {P(`M ${cx - 9} ${cy - 2} l 0 4`)}
    {P(`M ${cx + 9} ${cy - 2} l 0 4`)}
    {smile ? P(`M ${cx - 8} ${cy + 10} q 8 8 16 0`) : P(`M ${cx - 6} ${cy + 11} l 12 0`)}
  </>
);

/** 01 IDEA — a figure pausing mid-step, hand at the chin, a thought forming above. */
export function IdeaFigure() {
  return (
    <g className="figure">
      {head(120, 96)}{face(120, 96)}
      {P("M 108 124 c -18 8 -30 26 -30 50 l 0 44 c 0 6 8 8 20 8 l 44 0 c 12 0 20 -2 20 -8 l 0 -44 c 0 -24 -12 -42 -30 -50")}
      {P("M 112 140 c 6 -4 10 -4 16 0")}{P("M 108 156 c 8 -4 16 -4 24 0")}
      {P("M 82 176 c -14 -10 -22 -30 -12 -46")}
      {P("M 156 176 c 18 -6 26 -30 10 -58 c -6 -10 -14 -12 -20 -6")}{P("M 148 108 c -6 -2 -10 2 -10 8")}
      {P("M 96 224 l -8 44 c -2 6 2 8 8 8 l 14 0")}
      {P("M 140 224 l 10 40 c 2 6 -2 10 -8 10 l -14 0")}
      {P("M 88 276 l -10 6")}{P("M 150 274 l 10 6")}
      {P("M 176 54 c -16 -10 -18 -30 -4 -40 c 6 -18 34 -22 44 -6 c 18 2 24 24 10 36 c 4 14 -14 22 -24 14 c -10 6 -24 4 -26 -4 z")}
      {P("M 160 66 c 0 -6 8 -8 10 -2")}{P("M 150 78 c 0 -3 4 -4 5 -1")}
      {P("M 202 28 l 0 8 M 190 34 l 4 6 M 214 34 l -4 6 M 196 46 l 12 0 M 198 52 l 8 0")}
    </g>
  );
}

/** 02 DEVELOP — seated at a small round table, talking with a floating partner. */
export function DevelopFigure() {
  return (
    <g className="figure">
      {head(96, 104)}{face(96, 104)}
      {P("M 84 132 c -20 6 -30 24 -30 48 l 0 30 l 52 0 l 0 -30 c 0 -24 -8 -42 -22 -48")}
      {P("M 60 168 c -12 10 -14 26 -4 34 l 22 4")}{P("M 108 156 c 14 6 22 10 34 10")}
      {P("M 78 210 l -6 40 c 0 6 4 8 10 8 l 12 0 M 104 210 l 8 40 c 0 6 -4 8 -10 8 l -12 0")}
      {P("M 128 168 c 40 -6 76 -2 90 6 c 6 4 -4 8 -12 8 l -70 0 c -10 0 -14 -6 -8 -14 z")}
      {P("M 176 182 l 0 60 M 160 242 l 32 0")}
      {P("M 190 76 c -18 -18 6 -46 26 -30 c 22 -8 34 22 14 34 c -2 14 -30 16 -32 2 c -8 4 -14 -2 -8 -6 z")}
      {P("M 176 92 c -4 8 2 12 8 8 M 168 104 c -2 4 2 6 4 4")}
      {P("M 204 60 c 6 0 10 4 10 10")}{P("M 210 76 l 1 1")}
      {P("M 172 40 c 8 -12 30 -14 40 0", { strokeDasharray: "4 6" })}
      {P("M 140 112 c 10 -8 30 -8 40 0", { strokeDasharray: "3 7" })}
      {P("M 142 128 l 6 0 M 154 128 l 6 0 M 166 128 l 6 0")}
    </g>
  );
}

/** 03 WRITE — bent over a desk, pen moving, pages lifting off. */
export function WriteFigure() {
  return (
    <g className="figure">
      {head(104, 92)}{face(104, 92)}
      {P("M 92 120 c -18 6 -26 22 -26 40 l 0 36 l 52 0 l 0 -36 c 0 -18 -8 -34 -22 -40")}
      {P("M 68 150 c -8 14 0 26 12 28 l 40 6")}{P("M 116 148 c 12 8 26 16 44 22")}
      {P("M 160 172 l 14 -24")}{P("M 172 150 l 4 -8")}
      {P("M 40 190 l 170 0 c 6 0 8 6 2 8 l -176 0 z")}{P("M 60 198 l -6 60 M 196 198 l 6 60")}
      {P("M 120 184 l 46 -6 l 2 10 l -46 6 z")}{P("M 128 188 l 28 -4 M 130 194 l 20 -3")}
      {P("M 86 216 l -8 40 c 0 4 4 6 8 6 l 12 0 M 112 216 l 4 40 c 0 4 -4 6 -8 6 l -10 0")}
      {P("M 176 112 c 6 -14 22 -16 30 -6 l -18 22 z")}{P("M 200 88 c 10 -12 26 -12 34 0 l -20 20 z")}
      {P("M 190 136 c -6 -2 -10 2 -6 8", { strokeDasharray: "2 5" })}
      {P("M 176 40 c 10 -6 22 -6 30 2", { strokeDasharray: "3 6" })}
    </g>
  );
}

/** 04 SHARE — holding the page up high; readers lean in from either side. */
export function ShareFigure() {
  return (
    <g className="figure">
      {head(120, 100)}{face(120, 100)}
      {P("M 108 128 c -18 8 -28 26 -28 50 l 0 40 l 80 0 l 0 -40 c 0 -24 -10 -42 -28 -50")}
      {P("M 82 160 c -20 -10 -30 -40 -18 -70")}{P("M 158 160 c 22 -8 32 -40 22 -70")}
      {P("M 48 90 l 44 -14 l 6 30 l -44 14 z")}{P("M 58 96 l 26 -8 M 60 104 l 26 -8")}
      {P("M 176 76 l 36 20 l -14 26 l -36 -20 z")}{P("M 184 88 l 22 12 M 178 98 l 20 10")}
      {P("M 96 218 l -6 44 c 0 6 4 8 10 8 l 12 0 M 144 218 l 6 44 c 0 6 -4 8 -10 8 l -12 0")}
      {P("M 24 210 c 0 -22 34 -22 34 0 c 0 20 -34 20 -34 0 z")}{P("M 30 208 l 0 3 M 40 208 l 0 3 M 32 216 q 5 4 10 0")}
      {P("M 182 214 c 0 -22 34 -22 34 0 c 0 20 -34 20 -34 0 z")}{P("M 188 212 l 0 3 M 198 212 l 0 3 M 190 220 q 5 4 10 0")}
      {P("M 14 236 c -10 -14 10 -22 12 -8 c 2 -14 22 -6 12 8 l -12 10 z")}
      {P("M 222 240 c -10 -14 10 -22 12 -8 c 2 -14 22 -6 12 8 l -12 10 z")}
      {P("M 60 40 c 4 8 4 16 0 24 M 180 40 c -4 8 -4 16 0 24", { strokeDasharray: "3 6" })}
    </g>
  );
}

/** 05 BECOME CINEMA — clapperboard in hand, camera on its tripod, one foot forward. */
export function CinemaFigure() {
  return (
    <g className="figure">
      {head(96, 96)}{face(96, 96)}
      {P("M 84 124 c -18 8 -28 24 -28 48 l 0 40 l 64 0 l 0 -40 c 0 -24 -10 -40 -26 -48")}
      {P("M 58 152 c -18 -4 -26 -22 -18 -40 l 12 -16")}{P("M 122 150 c 16 2 28 -4 36 -16")}
      {P("M 24 80 l 60 0 l 0 40 l -60 0 z")}{P("M 24 80 l 12 -16 l 60 0 l -12 16")}{P("M 40 64 l 10 16 M 56 64 l 10 16 M 72 64 l 10 16")}
      {P("M 34 96 l 40 0 M 34 108 l 30 0")}
      {P("M 74 212 l -8 44 c 0 6 4 8 10 8 l 12 0 M 112 212 l 14 40 c 2 6 -2 10 -8 10 l -14 0")}
      {P("M 150 120 l 60 0 c 6 0 10 4 10 10 l 0 30 c 0 6 -4 10 -10 10 l -60 0 c -6 0 -10 -4 -10 -10 l 0 -30 c 0 -6 4 -10 10 -10 z")}
      {P("M 220 132 l 16 -8 l 0 32 l -16 -8")}{P("M 152 100 c 0 -14 22 -14 22 0 c 0 12 -22 12 -22 0 z M 178 100 c 0 -14 22 -14 22 0 c 0 12 -22 12 -22 0 z")}
      {P("M 180 170 l 0 20 M 180 190 l -24 60 M 180 190 l 24 60 M 180 190 l 0 60")}
      {P("M 130 150 l 12 -6 M 128 158 l 10 -2", { strokeDasharray: "2 5" })}
      {P("M 236 96 l 0 6 M 226 100 l 4 4 M 246 100 l -4 4")}
    </g>
  );
}

export const FIGURES = [IdeaFigure, DevelopFigure, WriteFigure, ShareFigure, CinemaFigure];
