/**
 * Clawd: the little pixel creature from Claude Code's welcome screen, rebuilt from its
 * block characters ( ▐▛███▜▌ / ▝▜█████▛▘ / ▘▘ ▝▝ ). Each block glyph is 2×2 quadrant pixels;
 * terminal cells are tall, so a pixel is 1 wide and 2 high. Animated by `src/styles/clawd.css`.
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

export type ClawdMood = 'happy' | 'busy' | 'wave';

export function clawd(className = '', mood: ClawdMood = 'happy'): string {
  return `
    <span class="clawd clawd--${mood} ${className}" aria-hidden="true">
      <svg viewBox="0 -4 18 18" shape-rendering="crispEdges">
        <g class="clawd__legs"><g class="clawd__legs-a">${rects(LEGS_A)}</g><g class="clawd__legs-b">${rects(LEGS_B)}</g></g>
        <g class="clawd__body">${rects(BODY)}</g>
        <g class="clawd__arms"><g class="clawd__arm-l">${rects(ARM_L)}</g><g class="clawd__arm-r">${rects(ARM_R)}</g></g>
        <g class="clawd__eye">${rects(EYES)}</g>
      </svg>
    </span>`;
}

/** A crowd of Clawds with staggered animation timing. */
export function clawdCrowd(n: number, className = '', mood: ClawdMood = 'busy'): string {
  return Array.from({ length: n }, (_, i) =>
    clawd(className, mood).replace('class="clawd ', `style="--clawd-d:${((i * 137) % 1000) / 1000}s" class="clawd `),
  ).join('');
}
