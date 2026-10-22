/**
 * Claude-kun: the little pixel creature from Claude Code's welcome screen, rebuilt from its
 * block characters ( ▐▛███▜▌ / ▝▜█████▛▘ / ▘▘ ▝▝ ). Each block glyph is 2×2 quadrant pixels;
 * terminal cells are tall, so a pixel is 1 wide and 2 high. Animated by `src/styles/claudekun.css`.
 */
type Px = [number, number];

const range = (a: number, b: number, y: number, skip: number[] = []): Px[] =>
  Array.from({ length: b - a + 1 }, (_, i) => a + i)
    .filter((x) => !skip.includes(x))
    .map((x) => [x, y]);

const BODY: Px[] = [...range(3, 14, 0), ...range(3, 14, 1, [5, 12]), ...range(3, 14, 2), ...range(3, 14, 3)];
const ARM_L: Px[] = [
  [1, 2],
  [2, 2],
];
const ARM_R: Px[] = [
  [15, 2],
  [16, 2],
];
const EYES: Px[] = [
  [5, 1],
  [12, 1],
];
const LEGS_A: Px[] = [
  [4, 4],
  [11, 4],
];
const LEGS_B: Px[] = [
  [6, 4],
  [13, 4],
];

const rects = (px: Px[]) => px.map(([x, y]) => `<rect x="${x}" y="${y * 2}" width="1" height="2"/>`).join('');

export type ClaudeKunMood = 'happy' | 'busy' | 'wave';

export function claudeKun(className = '', mood: ClaudeKunMood = 'happy'): string {
  return `
    <span class="ck ck--${mood} ${className}" aria-hidden="true">
      <svg viewBox="0 -4 18 18" shape-rendering="crispEdges">
        <g class="ck__legs"><g class="ck__legs-a">${rects(LEGS_A)}</g><g class="ck__legs-b">${rects(LEGS_B)}</g></g>
        <g class="ck__body">${rects(BODY)}</g>
        <g class="ck__arms"><g class="ck__arm-l">${rects(ARM_L)}</g><g class="ck__arm-r">${rects(ARM_R)}</g></g>
        <g class="ck__eye">${rects(EYES)}</g>
      </svg>
    </span>`;
}

/** A crowd of Claude-kuns with staggered animation timing. */
export function claudeKunCrowd(n: number, className = '', mood: ClaudeKunMood = 'busy'): string {
  return Array.from({ length: n }, (_, i) =>
    claudeKun(className, mood).replace('class="ck ', `style="--ck-d:${((i * 137) % 1000) / 1000}s" class="ck `),
  ).join('');
}
