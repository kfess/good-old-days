import { esc } from '../core/util';

/**
 * How each technology's name is shown: the official wordmark where the brand publishes one for
 * others to use (CNCF / OpenJS artwork repos, brand and press pages; files copied into
 * public/brand, never redrawn or recolored), otherwise the brand's own typeface when it is freely
 * licensed (Google Fonts), otherwise the closest free substitute. Restricted marks (MySQL, Apple)
 * stay plain text. So do names whose only available artwork or typeface is newer than the year the
 * name is shown for (an empty entry, with the reason): a 2013 scene must not wear a 2025 logo.
 */
interface Mark {
  /** wordmark for light backgrounds / dark backgrounds; `any` works on both */
  light?: string;
  dark?: string;
  any?: string;
  /** visual height relative to the name's font size (wordmarks differ in proportion) */
  scale?: number;
}

interface Brand {
  font?: string;
  weight?: number;
  transform?: 'uppercase' | 'none';
  /** letter-spacing in em */
  tracking?: number;
  mark?: Mark;
  /** text shown after a wordmark, e.g. a version: "1.0" */
  suffix?: string;
}

// brand typefaces (all on Google Fonts)
const UBUNTU = { font: "'Ubuntu', sans-serif", weight: 700 }; // Kubernetes wordmark (kubernetes/kubernetes logo/name_blue.svg)
const MONA = { font: "'Mona Sans', sans-serif", weight: 700 }; // GitHub brand typeface (2022.11): 2025 agents only
const GSANS = { font: "'Google Sans', 'Google Sans Flex', sans-serif", weight: 500 }; // Google (Product Sans, 2015)
const GFLEX = { font: "'Google Sans Flex', 'Google Sans', sans-serif", weight: 500 }; // Gemini from 2025 (Google Sans Flex)
const GEIST = { font: "'Geist', sans-serif", weight: 600 }; // Vercel
const INTER = { font: "'Inter', sans-serif", weight: 600 };
// substitutes for proprietary faces
const OPENAI = { font: "'Inter', sans-serif", weight: 600 }; // OpenAI Sans → Inter
const ANTHROPIC = { font: "'Poppins', sans-serif", weight: 600 }; // Anthropic Sans → Poppins (Anthropic's published fallback)
const META = { font: "'Inter', sans-serif", weight: 600 }; // Optimistic → Inter
const SEGOE = { font: "'Segoe UI', 'Selawik', system-ui, sans-serif", weight: 600 }; // Microsoft: Segoe UI where installed

const M = (file: string) => `${import.meta.env.BASE_URL}brand/${file}`;

const NEXT: Mark = { light: M('nextjs-on-light.svg'), dark: M('nextjs-on-dark.svg'), scale: 0.78 };
const TAILWIND: Mark = { light: M('tailwindcss-on-light.svg'), dark: M('tailwindcss-on-dark.svg'), scale: 0.82 };

export const BRANDS: Record<string, Brand> = {
  // ---- before 2010
  Flash: { font: "'Source Sans 3', sans-serif", weight: 700 }, // Myriad → Source Sans 3 (Adobe's open face)
  'Perl CGI': { font: "'Lato', sans-serif", weight: 900 },
  'Ruby on Rails': INTER,
  Firefox: {}, // 2004: the Firefox Sharp Sans wordmark only came with the 2019 rebrand
  Git: {}, // 2005: Jason Long's logo is from 2012
  jQuery: { mark: { light: M('jquery-on-light.svg'), dark: M('jquery-on-dark.svg'), scale: 1.35 } },
  'jQuery 1.4': {
    mark: { light: M('jquery-on-light.svg'), dark: M('jquery-on-dark.svg'), scale: 1.35 },
    suffix: '1.4',
  },
  'Amazon EC2': INTER, // Amazon Ember is proprietary
  GitHub: {}, // 2008: Mona Sans is from 2022
  'Google Chrome': {}, // 2008: Google Sans descends from the 2015 Product Sans
  iPhone: {}, // Apple's typefaces and marks may not be used: plain text

  // ---- 2010–2011
  'Node.js': {}, // 2010: the hexagon wordmark came with the July 2011 rebrand
  'Bootstrap 2': { font: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: 700 },
  'Twitter Bootstrap': { font: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: 700 },
  npm: { mark: { any: M('npm.svg'), scale: 0.8 } },
  Express: {}, // 2010: the boxed wordmark is from the May 2026 "new look"
  'Sass 3 (SCSS)': { font: "'Source Sans 3', sans-serif", weight: 700 }, // sass-lang.com's face
  'Rails 3': INTER,
  Heroku: { font: "'Questrial', sans-serif", weight: 400 }, // ITC Avant Garde → Questrial
  'Backbone.js': { mark: { light: M('backbone-on-light.png'), scale: 0.95 } },
  'CoffeeScript 1.0': { font: "'Alegreya Sans', sans-serif", weight: 700 },
  'Socket.IO': INTER,
  'jQuery UI 1.8': { mark: { light: M('jqueryui-on-light.svg'), scale: 1.35 }, suffix: '1.8' },

  // ---- 2012–2014
  AngularJS: { font: "'Roboto', sans-serif", weight: 500 },
  Docker: {}, // 2013: the only official wordmark is today's, not the 2013 smiling whale
  React: META,
  TypeScript: SEGOE,
  'Go 1.0': {}, // 2012: the slanted "GO" logo is from the 2018 rebrand
  Grunt: { font: "'Lato', sans-serif", weight: 900, transform: 'uppercase', tracking: 0.02 },
  'Sublime Text 2': INTER,
  Ansible: {}, // 2012: Red Hat Display is from 2019, after the Red Hat acquisition
  'Bootstrap 3': { font: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: 700 },
  gulp: INTER,
  'Vue.js': INTER, // vuejs.org sets the name in Inter
  Terraform: INTER, // HashiCorp Sans is not public

  // ---- 2015–2017
  Kubernetes: UBUNTU,
  'webpack 2': { mark: { light: M('webpack-on-light.svg'), scale: 1.05 }, suffix: '2' },
  'VS Code': SEGOE,
  Babel: { mark: { any: M('babel.svg'), scale: 1.25 } },
  Redux: { font: "'Lato', sans-serif", weight: 900 }, // Lato Black per the Redux logo README
  GraphQL: { mark: { any: M('graphql.svg'), scale: 1.05 } },
  'Rust 1.0': { font: "'Alfa Slab One', serif", weight: 400 }, // rust-lang.org
  Yarn: { mark: { any: M('yarn.svg'), scale: 1.2 } },
  'Next.js': {}, // 2016: nextjs-on-*.svg is the wordmark redrawn for Next.js 13 (2022); used from there on
  Prettier: INTER,
  WebAssembly: { mark: { light: M('webassembly-on-light.svg'), scale: 1.6 } },

  // ---- 2018–2020
  'React Hooks': META,
  'Tailwind CSS': {}, // 2019: tailwindcss-on-*.svg is the sky-blue mark of v2 (2020.11); v1 was a teal gradient
  'Managed Kubernetes': UBUNTU,
  'Istio 1.0': { mark: { dark: M('istio-on-dark.svg'), scale: 1.35 }, suffix: '1.0' },
  'Svelte 3': { mark: { any: M('svelte.svg'), scale: 0.95 }, suffix: '3' },
  'GitHub Actions': {}, // 2019: Mona Sans is from 2022
  'Helm 3': { mark: { dark: M('helm-on-dark.svg'), scale: 1.6 }, suffix: '3' },
  'Deno 1.0': { mark: { dark: M('deno-on-dark.svg'), scale: 1.05 }, suffix: '1.0' },
  'GPT-2': OPENAI,
  'GPT-3': OPENAI,

  // ---- 2021–2022
  Vite: INTER,
  'GitHub Copilot': {}, // 2021: Mona Sans is from 2022.11
  'Stable Diffusion': { font: "'Archivo', sans-serif", weight: 700 }, // stability.ai
  Astro: { mark: { dark: M('astro-on-dark.svg'), scale: 1.05 } },
  'Cloudflare Pages': INTER, // Inter is Cloudflare's brand typeface
  'SolidJS 1.0': { font: "'Poppins', sans-serif", weight: 600 }, // Gordita → Poppins
  Remix: { mark: { dark: M('remix-on-dark.svg'), scale: 0.72 } },
  Turborepo: { mark: { dark: M('turborepo-on-dark.svg'), scale: 0.8 } },
  Bun: { font: "'Archivo', sans-serif", weight: 800 },
  'Next.js 13': { mark: NEXT, suffix: '13' },

  // ---- 2023–2024
  'GPT-4': OPENAI,
  'Claude 3.5 Sonnet': ANTHROPIC,
  Cursor: INTER,
  MCP: INTER, // modelcontextprotocol.io sets its wordmark in Inter
  Claude: ANTHROPIC,
  'Llama 2': META,
  LangChain: { mark: { light: M('langchain-on-light.svg'), scale: 0.9 } },
  'Vercel AI SDK': { mark: { light: M('ai-sdk-on-light.svg'), scale: 0.85 } },
  'shadcn/ui': GEIST,
  Gemini: GSANS, // 2023: Google Sans Flex is from 2025

  // ---- 2025–2026
  'Claude Code': ANTHROPIC,
  'DeepSeek-R1': INTER,
  'Tailwind CSS v4': { mark: TAILWIND, suffix: 'v4' },
  'TypeScript native': SEGOE,
  'Codex CLI': OPENAI,
  'Claude 4': ANTHROPIC,
  'GPT-5': OPENAI,
  'GPT-6 Astra': OPENAI,
  'Agent SDK & Skills': ANTHROPIC,
  'Grok 3': INTER,
  'Gemini 2.5 Pro': GFLEX,
  'OpenAI o3': OPENAI,
  'Llama 4': META,
  Qwen3: INTER,
  'Copilot coding agent': MONA,
  'Gemini CLI': GFLEX,
  'Gemini 3': GFLEX,
};

const img = (src: string, cls: string) => `<img class="bmark ${cls}" src="${src}" alt="" draggable="false" />`;

function markHtml(m: Mark): string {
  if (m.any) return img(m.any, 'bmark--any');
  return `${m.light ? img(m.light, m.dark ? 'bmark--on-light' : 'bmark--any') : ''}${m.dark ? img(m.dark, m.light ? 'bmark--on-dark' : 'bmark--any') : ''}`;
}

/** Style attribute carrying the brand typeface (read by src/styles/brand.css). */
function fontStyle(b: Brand): string {
  if (!b.font) return '';
  return [
    `--brand-font:${b.font}`,
    `--brand-weight:${b.weight ?? 600}`,
    `--brand-tt:${b.transform ?? 'none'}`,
    `--brand-ls:${b.tracking ?? -0.01}em`,
  ].join(';');
}

/** Whether the name is rendered as an official wordmark image. */
export function hasWordmark(name: string): boolean {
  return !!BRANDS[name]?.mark;
}

/**
 * Inner HTML + attributes for a name element. Returns `{ attrs, html }` so callers keep their own
 * tag and class; the visible text stays available to assistive tech via aria-label.
 */
export function brandName(name: string): { cls: string; style: string; html: string } {
  const b = BRANDS[name];
  if (!b) return { cls: '', style: '', html: esc(name) };
  if (b.mark) {
    const suffix = b.suffix ? `<span class="bsuffix">${esc(b.suffix)}</span>` : '';
    return {
      cls: 'has-brand-mark',
      style: `--bmark-scale:${b.mark.scale ?? 1};${fontStyle(b)}`,
      html: `<span class="bmark-wrap" role="img" aria-label="${esc(name)}">${markHtml(b.mark)}${suffix}</span>`,
    };
  }
  if (b.font) return { cls: 'has-brand-font', style: fontStyle(b), html: esc(name) };
  return { cls: '', style: '', html: esc(name) };
}
