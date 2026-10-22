import { reducedMotion } from '../../core/scroll';
import { loopWhenVisible } from '../y2023/lib';

const RAMP = ' .:-=+*#%@';
const NOISE = '!<>-_\\/[]{}=+*^?#%$';
/** monospace cell width / height */
const ASPECT = 0.58;

/**
 * A rotating ASCII globe with an orbit ring, rendered into a <pre>.
 * On first view the characters scramble and then resolve — the page "building itself".
 */
export function mountAsciiGlobe(pre: HTMLElement, cols: number, rows: number): void {
  const R = rows / 2 - 1.5;
  const tilt = 0.38;
  const light = norm([-0.55, -0.6, 0.6]);
  let born = -1;
  let last = 0;

  const render = (t: number) => {
    if (born < 0) born = t;
    if (t - last < 33) return;
    last = t;
    const a = t / 2600;
    const grid: string[][] = Array.from({ length: rows }, () => Array<string>(cols).fill(' '));
    const depth: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(-Infinity));
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x = ((i + 0.5 - cols / 2) * ASPECT) / R;
        const y = (j + 0.5 - rows / 2) / R;
        const d = x * x + y * y;
        if (d > 1) continue;
        const z = Math.sqrt(1 - d);
        // undo tilt (around x) then spin (around y) to get surface coordinates
        const y1 = y * cosT + z * sinT;
        const z1 = -y * sinT + z * cosT;
        const u = x * cosA - z1 * sinA;
        const w = x * sinA + z1 * cosA;
        const lat = Math.asin(Math.max(-1, Math.min(1, y1)));
        const lon = Math.atan2(u, w);
        let s = 0.1 + 0.9 * Math.max(0, x * light[0] + y * light[1] + z * light[2]);
        const latLine = Math.abs(((lat / (Math.PI / 9)) % 1 + 1) % 1 - 0.5) > 0.42;
        const lonLine = Math.abs(((lon / (Math.PI / 8)) % 1 + 1) % 1 - 0.5) > 0.44;
        if (latLine || lonLine) s = Math.min(1, 0.35 + s * 0.75);
        else s *= 0.32;
        grid[j][i] = RAMP[Math.min(RAMP.length - 1, Math.max(1, Math.floor(s * RAMP.length)))];
        depth[j][i] = z;
      }
    }

    // orbit ring
    const ringR = 1.55;
    for (let k = 0; k < 220; k++) {
      const p = (k / 220) * Math.PI * 2 + a * 0.6;
      const rx = Math.cos(p) * ringR;
      const rz = Math.sin(p) * ringR;
      // tilt the ring a little more than the globe
      const ry = -rz * Math.sin(tilt + 0.12);
      const rz2 = rz * Math.cos(tilt + 0.12);
      const i = Math.round((rx * R) / ASPECT + cols / 2 - 0.5);
      const j = Math.round(ry * R + rows / 2 - 0.5);
      if (i < 0 || i >= cols || j < 0 || j >= rows) continue;
      const behind = rz2 < 0 && depth[j][i] > -Infinity;
      if (behind) continue;
      grid[j][i] = k % 31 === 0 ? '@' : rz2 > 0 ? '*' : '·';
    }

    // build-in scramble
    const age = t - born;
    const scramble = reducedMotion ? 0 : Math.max(0, 1 - age / 1600);
    let out = '';
    for (let j = 0; j < rows; j++) {
      let line = '';
      for (let i = 0; i < cols; i++) {
        const c = grid[j][i];
        line += scramble > 0 && c !== ' ' && Math.random() < scramble ? NOISE[(Math.random() * NOISE.length) | 0] : c;
      }
      out += line + '\n';
    }
    pre.textContent = out;
  };

  if (reducedMotion) {
    render(5000);
    return;
  }
  loopWhenVisible(pre, render);
}

function norm(v: number[]): number[] {
  const l = Math.hypot(v[0], v[1], v[2]);
  return v.map((x) => x / l);
}
