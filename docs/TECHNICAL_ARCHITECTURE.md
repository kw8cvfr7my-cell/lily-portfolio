# Technical Architecture

## Source template

Use the actual `island-portfolio` Skill's bundled Vite and Three.js template. Map About Lily to the template's profile/home screen and the other three requested areas (Insight Forest, AI Projects, Career Harbor) to its three scene categories. This honors Lily's requested four-area journey while keeping the scene total aligned with the three explorable destinations. Keep personal content in the template's single portfolio data file and keep source assets local.

## Runtime and deployment

- Static Vite build, suitable for GitHub Pages.
- Configure a repository-specific base path for `yllld8848Lilyang/lily-portfolio`, the canonical owner/name returned by the connected GitHub repository lookup.
- Deploy from the generated `dist/` directory through GitHub Actions after local verification.
- No server-only features or remote model/font dependencies.

## Resilience and access

Keep content readable through direct category links if WebGL is unavailable. Support keyboard access, reduced motion, mobile viewports, and sound-off by default. Load the English/Chinese strings from paired locale data.

## Content integrity

Validate exactly three scene categories, unique IDs, safe HTTP(S)/mailto links, and explicit empty-state confirmation. Avoid including unapproved CV files in the public assets folder.

## Verification

Follow the source Skill's install, test, build, and browser-check sequence. Check all four entries, themes, map, movement, image viewer, sound toggle, global view, language switch, and narrow screen behavior before release.
