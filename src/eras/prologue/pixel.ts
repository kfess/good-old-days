/** Pixel-art helpers: every illustration of the prologue is drawn on a crisp pixel grid. */

/** Render a character map as an SVG; each char is a palette key, `.` is transparent. */
export function pixelArt(rows: string[], palette: Record<string, string>, cls = '', label = ''): string {
  const height = rows.length;
  const width = Math.max(...rows.map((r) => r.length));
  let rects = '';
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (!palette[c]) {
        x++;
        continue;
      }
      let run = 1;
      while (row[x + run] === c) run++;
      rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${palette[c]}"/>`;
      x += run;
    }
  });
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<svg class="px ${cls}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges" ${a11y}>${rects}</svg>`;
}

export const star = (cls = '') =>
  pixelArt(
    ['....Y....', '....Y....', '...YYY...', 'YYYYWYYYY', '.YYYYYYY.', '..YYYYY..', '..YY.YY..', '.YY...YY.', '.Y.....Y.'],
    { Y: '#ffff00', W: '#ffffff' },
    cls,
  );

export const cone = (cls = '') =>
  pixelArt(
    ['....O....', '...OOO...', '...WWW...', '...OOO...', '..OOOOO..', '..WWWWW..', '..OOOOO..', '.OOOOOOO.', 'KKKKKKKKK'],
    { O: '#ff7a00', W: '#ffffff', K: '#333333' },
    cls,
  );

export const envelope = (cls = '') =>
  pixelArt(
    [
      'KKKKKKKKKKKKK',
      'KWKWWWWWWWKWK',
      'KWWKWWWWWKWWK',
      'KWWWKWWWKWWWK',
      'KWWWWKWKWWWWK',
      'KWWWWWKWWWWWK',
      'KWWWWWWWWWWWK',
      'KKKKKKKKKKKKK',
    ],
    { K: '#000080', W: '#ffffff' },
    cls,
  );

export const puzzle = (cls = '') =>
  pixelArt(
    [
      '.....KKKK.......',
      '....KGGGGK......',
      '....KGGGGK......',
      '.KKKKGGGGKKKKK..',
      '.KGGGGGGGGGGGK..',
      '.KGGGGGGGGGGGKKK',
      '.KGGGGGGGGGGGGGGK',
      '.KGGGGGGGGGGGGGGK',
      '.KGGGGGGGGGGGKKK',
      '.KGGGGGGGGGGGK..',
      '.KGGGGGGGGGGGK..',
      '.KKKKKKKKKKKKK..',
    ],
    { K: '#4a4a4a', G: '#bdbdbd' },
    cls,
    'missing plugin',
  );

export const phone = (cls = '') =>
  pixelArt(
    [
      '.KKKKKKKKKKKK.',
      'KSSSSSSSSSSSSK',
      'KSSSSKKKKSSSSK',
      'KSCCCCCCCCCCSK',
      'KSCBBCCBBCCCSK',
      'KSCBBCCBBCCCSK',
      'KSCCCCCCCCCCSK',
      'KSCBBCCBBCCCSK',
      'KSCBBCCBBCCCSK',
      'KSCCCCCCCCCCSK',
      'KSCBBCCBBCCCSK',
      'KSCBBCCBBCCCSK',
      'KSCCCCCCCCCCSK',
      'KSCCCCCCCCCCSK',
      'KSSSSSSSSSSSSK',
      'KSSSSSKKSSSSSK',
      'KSSSSKSSKSSSSK',
      'KSSSSSKKSSSSSK',
      'KSSSSSSSSSSSSK',
      '.KKKKKKKKKKKK.',
    ],
    { K: '#111111', S: '#2b2b2b', C: '#39a0ff', B: '#ffffff' },
    cls,
    'smartphone',
  );

/** The intro illustration: a beige CRT showing a tiny homepage. */
export function crt(): string {
  // screen content: 36×22 pixels at (14,8)
  const keys = Array.from({ length: 10 }, (_, i) => `<rect x="${12 + i * 4}" y="50" width="3" height="1" fill="#b9b19a"/>`).join('');
  return `
  <svg class="px p-crt" viewBox="0 0 64 58" shape-rendering="crispEdges" role="img" aria-label="beige CRT computer showing a homepage">
    <rect x="7" y="1" width="50" height="38" fill="#5e5848"/>
    <rect x="8" y="2" width="48" height="36" fill="#d8d0b8"/>
    <rect x="8" y="2" width="48" height="1" fill="#efe9d6"/>
    <rect x="11" y="5" width="42" height="28" fill="#9e9680"/>
    <rect x="13" y="7" width="38" height="24" fill="#000033"/>
    <!-- stars -->
    <rect x="16" y="9" width="1" height="1" fill="#fff"/><rect x="44" y="11" width="1" height="1" fill="#fff"/>
    <rect x="22" y="27" width="1" height="1" fill="#fff"/><rect x="48" y="25" width="1" height="1" fill="#ffd"/>
    <!-- title -->
    <rect x="18" y="10" width="28" height="2" fill="#ffff00"/>
    <!-- marquee line: the moving segment scrolls through, clipped to the screen so it never runs onto the bezel -->
    <clipPath id="p-crt-screen"><rect x="13" y="7" width="38" height="24"/></clipPath>
    <rect x="14" y="14" width="36" height="1" fill="#00ffff" opacity=".5"/>
    <g clip-path="url(#p-crt-screen)">
      <rect x="14" y="14" width="10" height="1" fill="#00ffff">
        <animate attributeName="x" values="51;3" dur="3s" repeatCount="indefinite"/>
      </rect>
    </g>
    <!-- nav column -->
    <rect x="15" y="17" width="6" height="1" fill="#ff66ff"/><rect x="15" y="19" width="6" height="1" fill="#ff66ff"/>
    <rect x="15" y="21" width="6" height="1" fill="#ff66ff"/><rect x="15" y="23" width="6" height="1" fill="#ff66ff"/>
    <!-- body text -->
    <rect x="24" y="17" width="20" height="1" fill="#ffffff"/><rect x="24" y="19" width="24" height="1" fill="#ffffff"/>
    <rect x="24" y="21" width="16" height="1" fill="#ffffff"/>
    <rect x="45" y="17" width="4" height="1" fill="#ff0000"><animate attributeName="opacity" values="1;1;0;0" dur="1s" repeatCount="indefinite"/></rect>
    <!-- under construction stripe -->
    <rect x="24" y="24" width="14" height="3" fill="#ffcc00"/>
    <rect x="25" y="24" width="2" height="3" fill="#000"/><rect x="29" y="24" width="2" height="3" fill="#000"/>
    <rect x="33" y="24" width="2" height="3" fill="#000"/><rect x="37" y="24" width="1" height="3" fill="#000"/>
    <!-- counter -->
    <rect x="40" y="24" width="9" height="3" fill="#000"/>
    <rect x="41" y="25" width="7" height="1" fill="#00ff66"><animate attributeName="width" values="1;7" dur="2.4s" repeatCount="indefinite"/></rect>
    <!-- scanlines + glare -->
    <rect x="13" y="8" width="38" height="1" fill="#fff" opacity=".07"/><rect x="13" y="12" width="38" height="1" fill="#fff" opacity=".07"/>
    <rect x="13" y="16" width="38" height="1" fill="#fff" opacity=".07"/><rect x="13" y="20" width="38" height="1" fill="#fff" opacity=".07"/>
    <rect x="13" y="24" width="38" height="1" fill="#fff" opacity=".07"/><rect x="13" y="28" width="38" height="1" fill="#fff" opacity=".07"/>
    <rect x="15" y="8" width="5" height="1" fill="#fff" opacity=".25"/><rect x="14" y="9" width="2" height="3" fill="#fff" opacity=".18"/>
    <!-- power led + badge -->
    <rect x="50" y="35" width="2" height="1" fill="#00ff66"><animate attributeName="opacity" values="1;.3;1" dur="2s" repeatCount="indefinite"/></rect>
    <rect x="12" y="35" width="8" height="1" fill="#9e9680"/>
    <!-- stand -->
    <rect x="25" y="39" width="14" height="3" fill="#bfb79f"/>
    <rect x="18" y="42" width="28" height="3" fill="#d8d0b8"/><rect x="18" y="44" width="28" height="1" fill="#9e9680"/>
    <!-- keyboard -->
    <rect x="9" y="47" width="46" height="8" fill="#5e5848"/>
    <rect x="10" y="48" width="44" height="6" fill="#d8d0b8"/>
    ${keys}
    <rect x="12" y="52" width="40" height="1" fill="#b9b19a"/>
    <!-- mouse -->
    <rect x="57" y="50" width="5" height="6" fill="#5e5848"/><rect x="58" y="51" width="3" height="4" fill="#d8d0b8"/>
    <rect x="59" y="45" width="1" height="5" fill="#5e5848"/>
  </svg>`;
}

/** The shared-hosting box "zeus". */
export function zeus(): string {
  const bays = [6, 11, 16]
    .map((y) => `<rect x="5" y="${y}" width="18" height="4" fill="#9e9680"/><rect x="6" y="${y + 1}" width="16" height="2" fill="#c9c1a8"/><rect x="19" y="${y + 1}" width="2" height="1" fill="#5e5848"/>`)
    .join('');
  return `
  <svg class="px p-zeus__svg" viewBox="0 0 28 44" shape-rendering="crispEdges" role="img" aria-label="server named zeus">
    <rect x="2" y="1" width="24" height="42" fill="#5e5848"/>
    <rect x="3" y="2" width="22" height="40" fill="#d8d0b8"/>
    <rect x="3" y="2" width="22" height="1" fill="#efe9d6"/>
    ${bays}
    <rect x="5" y="23" width="18" height="1" fill="#9e9680"/>
    <rect x="6" y="26" width="2" height="1" fill="#00ff66"><animate attributeName="opacity" values="1;.2;1;1;.2" dur="1.3s" repeatCount="indefinite"/></rect>
    <rect x="9" y="26" width="2" height="1" fill="#ffaa00"><animate attributeName="opacity" values=".2;1;.2;1" dur=".7s" repeatCount="indefinite"/></rect>
    <rect x="12" y="26" width="2" height="1" fill="#00ff66"/>
    <rect x="5" y="30" width="18" height="8" fill="#c9c1a8"/>
    ${Array.from({ length: 4 }, (_, i) => `<rect x="6" y="${31 + i * 2}" width="16" height="1" fill="#9e9680"/>`).join('')}
    <rect x="9" y="39" width="10" height="2" fill="#000080"/>
    <rect x="1" y="43" width="26" height="1" fill="#000" opacity=".4"/>
  </svg>`;
}
