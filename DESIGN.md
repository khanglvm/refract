# Refract: design

Chosen by Khang on 2026-11-24 over four rounds on Relay boards: a flat outline prism with one beam that bends through it and leaves as three rays fading from indigo to pale. It stands for one store and the slices that selectors pick from it.

## Mark

- Source: `assets/logo.svg` (light), `assets/logo-dark.svg` (dark: ink #ECEAF7, rays #8B85FF), `assets/icon.svg` (512 px tile, #F4F4F8, 112 px radius).
- Raster: `assets/banner-light.png`, `assets/banner-dark.png` (1280 x 640, README and social), `assets/icon.png` (512 px). Re-render them from the HTML in `design-previews/r4/final-*.html` (local only) with a headless browser when the mark or name changes.
- The beam bends on entry: ink outside the prism, indigo inside and on the main ray; side rays at 45% and 20% opacity.

## Tokens

| Role | Value |
| --- | --- |
| Background | #FAFAFC |
| Card | #FFFFFF |
| Ink | #1E1B3A |
| Muted text | #5E5B78 |
| Border | #E8E7F0 |
| Muted surface | #F3F3F8 |
| Accent | #4F46E5 |
| Accent wash | #EEEDFD |

- Type: Inter Tight (text, 700 for headings, -0.035em on the hero), JetBrains Mono with ligatures off for code and commands.
- Radius: 14 px cards, 12 px demo cards, 10 px icon tiles, full pill for buttons and the install command.
- Icons: Lucide paths inlined in `site/src/icons.tsx`, 1.75 px stroke.
- Light only, like docs.khangle.dev.

## Landing page (site/)

Hero (mark, headline, one paragraph, install command, Quick start and GitHub), a live demo, a code example, "What you get", footer. "What you get" is a tab list (a vertical list on desktop, a sideways-scrolling row under 900 px that keeps the selected tab in view) beside a panel with one live playground per strength: render counts for fine-grained rerenders, a city field next to the useState spread it replaces, server renders through the real `renderToString` (loaded on first click), an optimistic save whose revert keeps likes added meanwhile, and three counters under separate Providers. Each playground runs the library source and shows the code it runs. The demo runs the library source: three cards subscribe to different slices and count their renders, the card that renders replays an indigo wash for 900 ms, and Undo calls the last update's revert. Reduced motion shortens the wash to 1 ms. No eyebrows, subtitles under headings or status dots.
