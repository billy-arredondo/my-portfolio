# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start dev server (localhost:4321)
pnpm build        # production build → dist/
pnpm preview      # preview the dist/ build
pnpm generate:cv  # generate CV PDF via scripts/generate-cv-pdf.mjs
```

Always use `pnpm`. Never use `npm` — the project uses `pnpm-lock.yaml` and the CI is configured for pnpm. There are no lint or type-check scripts; type errors surface during `pnpm build`. Never run `git push` unless the user explicitly asks.

## Architecture

**Astro 6 + React 19, fully static (`output: 'static'`)**. Deployed to Azure Static Web Apps via `.github/workflows/azure-static-web-apps-calm-cliff-0fe0cc003.yml`. The workflow (Node 22, pnpm v10) runs `pnpm build` and passes `skip_app_build: true` + `app_location: "dist"` to the deploy action (Oryx is bypassed). Authentication uses OIDC (`github_id_token` via `actions/github-script@v6`) plus the `AZURE_STATIC_WEB_APPS_API_TOKEN_CALM_CLIFF_0FE0CC003` repository secret.

**Important:** `astro.config.mjs` has `site: 'https://example.com'` as a placeholder — update this before going live, as it affects sitemap and hreflang URLs.

### Path alias

`@/` maps to `./src/` (configured in `tsconfig.json`). Use `@/components/...`, `@/lib/...`, etc. throughout.

### Islands

Astro handles all layout and page rendering server-side. React components are hydrated selectively:

- `client:load` — interactive immediately (MobileNav)
- `client:idle` — hydrated when idle (ThemeToggle on desktop)

### i18n (2 locales: en / es)

- Default locale (`en`) has **no URL prefix**: `/`, `/projects`, `/about`
- Non-default locales are prefixed: `/es/`
- Translations live in `src/i18n/ui.ts` — one flat key/value object per locale
- Key helpers in `src/i18n/utils.ts`:
  - `getLangFromUrl(url)` — extracts lang from URL
  - `useTranslations(lang)` — returns a `t(key)` function
  - `localizedPath(lang, path)` — generates the correct prefixed URL
  - `getAlternatePaths(path, lang)` — used for hreflang alternate links

Each locale has **mirrored page files**: `src/pages/index.astro`, `src/pages/es/index.astro`. When adding a new page, create both variants. The ES page hardcodes `const lang = 'es'` rather than calling `getLangFromUrl`.

**Exception:** `/es/about` does not exist as a page file — `astro.config.mjs` redirects it to `/about` (the EN version). Do not create `src/pages/es/about.astro` without removing that redirect first.

### Content collections (`src/content.config.ts`)

- `projects` — MDX files at `src/content/projects/{locale}/{slug}.mdx`. Schema requires `locale`, `translationKey` (links translations of the same project across locales), `status`, `featured`, `stack`, `role`, `year`, `startDate`.
- `posts` — defined but unused (no content directory, no pages).

To add a project: create the MDX file in each locale subdirectory (`en/`, `es/`) with the same `translationKey`. The `description` field has a **200-character max** enforced by the schema.

### Component structure

```
src/components/
  home/       # FeaturedProjects, Hero, TechStack, Typewriter (React)
  projects/   # ProjectCard, StatusBadge
  seo/        # SEO.astro (hreflang, OG, canonical, JSON-LD)
  site/       # Header, Footer, MobileNav (React), LanguageSwitcher (React), ThemeToggle (React)
  ui/         # shadcn-style primitives (badge, button, card, sheet, dropdown-menu, …)
```

`src/lib/utils.ts` exports `cn()` (clsx + tailwind-merge) — use this for all conditional class composition.

### Styling

Tailwind v4 configured via `@tailwindcss/vite` Vite plugin (no `tailwind.config.js`). Theme tokens are defined as OKLCH CSS custom properties in `src/styles/globals.css` using `@theme`. Light/dark values are set on `:root` and `.dark` respectively. UI primitives are shadcn-style components in `src/components/ui/` using CVA + Radix UI.

### ClientRouter (View Transitions)

`<ClientRouter />` from `astro:transitions` is in `BaseLayout.astro`. Two known behaviors to keep in mind:

1. **Theme persistence**: The `applyTheme()` function in `BaseLayout.astro` runs on both initial load and `astro:after-swap` — this is intentional. Do not simplify it back to a one-time script.
2. **Smart header**: `Header.astro` includes a bundled `<script>` that listens to `astro:page-load` to re-register scroll listeners after each navigation. The scroll handler reads `document.body.dataset.navOpen` to pause while MobileNav is open.

### MobileNav ↔ Header communication

`Header.astro` pre-computes `langLinks` (array of `{code, label, href, current}`) and passes them as props to `MobileNav`. The MobileNav sheet contains language switcher + theme toggle for mobile; the header shows them only on desktop (`hidden md:flex`). When the sheet opens, `document.body.dataset.navOpen = "true"` is set to block the scroll-hide behavior.

## Key files

| File | Purpose |
| --- | --- |
| `src/layouts/BaseLayout.astro` | Root HTML shell, ClientRouter, theme script |
| `src/i18n/ui.ts` | All translation strings for en/es |
| `src/content.config.ts` | Zod schemas for content collections |
| `src/lib/seo.ts` | `buildHreflang`, `buildCanonical`, `getOgLocale`, JSON-LD builders |
| `src/lib/projects.ts` | `getProjects`, `getFeaturedProjects`, `getProjectBySlug`, `getProjectSlug`, `getTranslationsForProject` |
| `src/components/site/Header.astro` | Nav, smart scroll script, lang/theme controls |
| `src/components/site/MobileNav.tsx` | Sheet with nav + lang + theme (mobile) |
| `staticwebapp.config.json` | Azure SWA routing fallback, cache headers (1yr immutable for `/_astro/`, `must-revalidate` for HTML), security headers |
| `docs/ux-audit.md` | Prioritised UX/a11y backlog (not served) |
| `.github/workflows/azure-static-web-apps-calm-cliff-0fe0cc003.yml` | CI/CD: pnpm build + Azure SWA deploy (OIDC) |
