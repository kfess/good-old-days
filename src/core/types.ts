export interface EraTheme {
  /** page background behind the era (interpolated between eras while scrolling) */
  bg: string;
  /** main text color */
  fg: string;
  /** era accent color, used by HUD and shared components */
  accent: string;
  /** secondary text color */
  muted: string;
}

export interface Era {
  /** matches the folder name and the `.era--{id}` CSS scope */
  id: string;
  /** first and last year shown by the HUD odometer while this era is on screen */
  years: [number, number];
  /** short name shown in the HUD, e.g. "Web 2.0" */
  label: string;
  theme: EraTheme;
  /** CSS font-family the HUD uses while this era is on screen */
  hudFont: string;
  /** server meter value for this era */
  servers: { value: number | '∞'; unit: string };
  /** builds the era's DOM inside `section` and registers its animations */
  render(section: HTMLElement): void;
}
