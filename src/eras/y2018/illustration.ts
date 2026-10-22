/** Original flat "big-limbed people" illustration (2018–2020 corporate flat style). */
export const ILLUST_2018 = `
<svg class="y18-illust" viewBox="0 0 640 520" role="img" aria-label="Flat illustration: one person lifting a stack of containers, another deploying from a laptop on a cloud">
  <defs>
    <pattern id="y18dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#8a94b2" opacity=".35"/></pattern>
  </defs>
  <path d="M120 140 C200 40 420 30 520 140 C620 250 560 430 400 452 C240 474 60 420 70 300 C76 220 90 180 120 140Z" fill="#1a2150"/>
  <rect x="60" y="60" width="150" height="110" fill="url(#y18dots)"/>
  <circle cx="566" cy="300" r="48" fill="#ff7a59"/>
  <path d="M40 470 a70 70 0 0 1 140 0Z" fill="#7c5cff"/>
  <ellipse cx="320" cy="474" rx="250" ry="10" fill="#000" opacity=".25"/>

  <!-- floating pods -->
  <g class="y18-float" style="--fd:5s">
    <path d="M330 120 l20 -11.5 l20 11.5 v23 l-20 11.5 l-20 -11.5Z" fill="none" stroke="#5b8cff" stroke-width="3"/>
    <path d="M341 132 l6 6 l12 -12" fill="none" stroke="#06d6a0" stroke-width="3" stroke-linecap="round"/>
  </g>
  <g class="y18-float" style="--fd:6.5s; --fdl:-2s">
    <path d="M372 236 l15 -8.6 l15 8.6 v17.3 l-15 8.6 l-15 -8.6Z" fill="#326ce5"/>
  </g>
  <g class="y18-float" style="--fd:7s; --fdl:-1s">
    <path d="M286 60 l11 -6.4 l11 6.4 v12.8 l-11 6.4 l-11 -6.4Z" fill="#ffd166"/>
  </g>

  <!-- cloud + deployer -->
  <g class="y18-cloud">
    <path d="M150 300 Q146 232 196 222 Q240 232 232 300Z" fill="#2ec4b6"/>
    <circle cx="196" cy="198" r="17" fill="#b388ff"/>
    <path d="M178 196 q2 -24 22 -22 q18 4 14 18 q-12 -10 -36 4Z" fill="#1d1b4b"/>
    <path d="M160 254 q10 34 34 36" stroke="#b388ff" stroke-width="11" stroke-linecap="round" fill="none"/>
    <circle cx="140" cy="346" r="40" fill="#e8e6ff"/>
    <circle cx="192" cy="322" r="52" fill="#e8e6ff"/>
    <circle cx="248" cy="342" r="40" fill="#e8e6ff"/>
    <rect x="104" y="334" width="180" height="46" rx="23" fill="#e8e6ff"/>
    <path d="M182 300 Q168 362 146 404" stroke="#1d1b4b" stroke-width="17" stroke-linecap="round" fill="none"/>
    <path d="M208 300 Q218 364 204 408" stroke="#1d1b4b" stroke-width="17" stroke-linecap="round" fill="none"/>
    <ellipse cx="138" cy="410" rx="18" ry="7" fill="#ff7a59"/>
    <ellipse cx="206" cy="414" rx="18" ry="7" fill="#ff7a59"/>
    <path d="M160 300 L236 300 L230 306 L166 306Z" fill="#c9cbe0"/>
    <path d="M176 262 L224 262 L232 300 L184 300Z" fill="#9aa0c3"/>
    <path d="M190 276 h22" stroke="#5b8cff" stroke-width="3" stroke-linecap="round"/>
    <path d="M228 252 q-6 34 -30 44" stroke="#b388ff" stroke-width="11" stroke-linecap="round" fill="none"/>
  </g>

  <!-- container lifter -->
  <g class="y18-lifter">
    <path d="M438 320 L462 320 L450 462 L424 462Z" fill="#1d1b4b"/>
    <path d="M466 320 L490 320 L514 460 L490 462Z" fill="#1d1b4b"/>
    <ellipse cx="428" cy="466" rx="24" ry="8" fill="#fff"/>
    <ellipse cx="510" cy="464" rx="24" ry="8" fill="#fff"/>
    <path d="M430 332 Q418 230 470 212 Q522 226 500 332Z" fill="#ff9f43"/>
    <path d="M440 240 Q420 290 424 330" stroke="#ff9f43" stroke-width="16" stroke-linecap="round" fill="none"/>
    <circle cx="425" cy="334" r="8" fill="#ffb4a2"/>
    <path d="M496 236 Q530 190 548 128" stroke="#ff9f43" stroke-width="16" stroke-linecap="round" fill="none"/>
    <circle cx="472" cy="190" r="18" fill="#ffb4a2"/>
    <path d="M452 186 q4 -26 26 -22 q16 4 12 16 q-8 -8 -38 6Z" fill="#1d1b4b"/>
    <g class="y18-boxes">
      <circle cx="548" cy="126" r="9" fill="#ffb4a2"/>
      <rect x="500" y="88" width="96" height="32" rx="4" fill="#326ce5"/>
      <rect x="508" y="54" width="82" height="32" rx="4" fill="#ffd166"/>
      <rect x="516" y="22" width="70" height="30" rx="4" fill="#ef476f"/>
      <path d="M516 94 v20 M532 94 v20 M548 94 v20 M564 94 v20 M580 94 v20 M524 60 v20 M540 60 v20 M556 60 v20 M572 60 v20 M530 28 v18 M546 28 v18 M562 28 v18" stroke="#000" stroke-opacity=".18" stroke-width="3"/>
    </g>
  </g>

  <!-- plant -->
  <path d="M590 470 q-30 -60 -6 -120 q20 50 6 120Z" fill="#06d6a0"/>
  <path d="M596 470 q20 -50 44 -64 q-6 44 -44 64Z" fill="#2ec4b6"/>
</svg>`;
