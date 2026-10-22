import { esc } from '../core/util';
import '../styles/oreilly.css';

/**
 * An original parody tech-book cover in the style of the "O RLY?" meme covers
 * (no real publisher's name or artwork): white cover, coloured bands, an engraving-style animal.
 */
export type ParodyAnimal = 'goat' | 'raccoon' | 'robot';

export interface ParodyBookOptions {
  title: string;
  subtitle: string;
  /** colour of the top rule and the title band */
  band: string;
  animal: ParodyAnimal;
  /** e.g. "2nd Edition" */
  edition?: string;
  /** small label top-left, defaults to "Essential" */
  label?: string;
  /** extra class on the root */
  className?: string;
}

const STROKE = 'fill="none" stroke="#1d1d1d" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"';

// engraving look: outline + parallel hatching strokes
const ANIMALS: Record<ParodyAnimal, string> = {
  goat: `
    <path ${STROKE} d="M28 46 C28 37 36 34 48 34 L80 34 C90 34 95 39 95 47 C95 55 89 59 80 59 L44 59 C34 59 28 55 28 46 Z"/>
    <path ${STROKE} d="M88 37 C90 28 95 21 103 19 C109 18 115 21 116 25 C117 29 114 31 110 31 L105 32 C101 34 99 38 98 44"/>
    <path ${STROKE} d="M101 20 C97 12 90 9 83 11 M104 19 C101 10 94 6 88 7"/>
    <path ${STROKE} d="M99 24 L91 27 L98 29"/>
    <path ${STROKE} d="M111 31 L109 40 L107 32"/>
    <path ${STROKE} d="M38 59 L37 78 M46 59 L46 79 M78 59 L79 79 M86 58 L88 77 M35 78 L39 78 M44 79 L48 79 M77 79 L81 79 M86 77 L90 77"/>
    <path ${STROKE} d="M29 42 C24 38 24 33 28 31"/>
    <path ${STROKE} stroke-width=".55" d="M38 38 L45 57 M45 36 L52 58 M52 35 L59 58 M59 35 L66 58 M66 35 L73 58 M73 35 L80 58 M80 36 L86 55"/>
    <circle cx="107" cy="24" r="1.1" fill="#1d1d1d"/>`,
  raccoon: `
    <path ${STROKE} d="M34 60 C30 46 44 38 60 39 C76 40 86 44 88 54 C90 62 82 66 66 66 C52 66 38 66 34 60 Z"/>
    <path ${STROKE} d="M84 46 C88 38 96 34 104 36 C110 38 112 44 108 48 C104 52 96 54 88 54"/>
    <path ${STROKE} d="M92 37 L94 30 L98 36 M102 35 L106 29 L107 37"/>
    <path fill="#1d1d1d" d="M94 42 C98 40 104 40 107 43 C104 46 98 46 94 44 Z"/>
    <circle cx="97" cy="43" r="1.2" fill="#fff"/><circle cx="104" cy="43" r="1.2" fill="#fff"/>
    <path ${STROKE} d="M36 58 C24 58 14 52 12 44 C11 40 14 38 18 40"/>
    <path ${STROKE} stroke-width="2.2" d="M16 49 L20 45 M22 53 L26 49 M28 56 L32 52"/>
    <path ${STROKE} d="M44 66 L42 80 M54 66 L54 81 M72 66 L73 81 M80 64 L83 79"/>
    <path ${STROKE} stroke-width=".6" d="M44 46 L50 62 M50 44 L56 63 M56 43 L62 63 M62 42 L68 63 M68 42 L74 63 M74 43 L79 61"/>`,
  robot: `
    <rect ${STROKE} x="44" y="24" width="40" height="30" rx="5"/>
    <path ${STROKE} d="M64 24 L64 15"/><circle ${STROKE} cx="64" cy="13" r="2.5"/>
    <circle ${STROKE} cx="55" cy="38" r="5"/><circle ${STROKE} cx="73" cy="38" r="5"/>
    <circle cx="55" cy="38" r="1.6" fill="#1d1d1d"/><circle cx="73" cy="38" r="1.6" fill="#1d1d1d"/>
    <path ${STROKE} d="M55 48 L73 48"/>
    <rect ${STROKE} x="40" y="58" width="48" height="22" rx="3"/>
    <path ${STROKE} d="M40 64 L28 72 M88 64 L100 72"/>
    <path ${STROKE} stroke-width=".6" d="M46 62 L46 78 M52 62 L52 78 M58 62 L58 78 M64 62 L64 78 M70 62 L70 78 M76 62 L76 78 M82 62 L82 78"/>
    <circle ${STROKE} cx="44" cy="28" r=".8"/><circle ${STROKE} cx="84" cy="28" r=".8"/>`,
};

export function parodyBook(o: ParodyBookOptions): string {
  return `
    <figure class="orly ${o.className ?? ''}" style="--orly-band:${o.band}" role="img" aria-label="Parody book cover: ${esc(o.title)}">
      <div class="orly__rule"></div>
      <div class="orly__top"><span>${esc(o.label ?? 'Essential')}</span>${o.edition ? `<span>${esc(o.edition)}</span>` : ''}</div>
      <p class="orly__sub">${esc(o.subtitle)}</p>
      <svg class="orly__art" viewBox="0 0 128 88" aria-hidden="true">${ANIMALS[o.animal]}</svg>
      <div class="orly__band"><span class="orly__title">${esc(o.title)}</span></div>
      <div class="orly__foot"><b>O RLY<sup>?</sup></b><span>The Practical Developer</span></div>
    </figure>`;
}
