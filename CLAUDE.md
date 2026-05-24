# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start dev server (localhost:4321)
pnpm build        # production build → dist/
pnpm preview      # preview the dist/ build
```

Always use `pnpm`. Never use `npm` — the project uses `pnpm-lock.yaml` and the CI (`azure-swa.yml`) is configured for pnpm.

## Architecture

**Astro 6 + React 19, fully static (`output: 'static'`)**. Deployed to Azure Static Web Apps via `.github/workflows/azure-swa.yml` with `skip_app_build: true` (Oryx is bypassed; the workflow runs `pnpm build` itself).

### Islands

Astro handles all layout and page rendering server-side. React components are hydrated selectively:
- `client:load` — interactive immediately (MobileNav)
- `client:idle` — hydrated when idle (ThemeToggle on desktop)

### i18n (3 locales: en / es / pt)

- Default locale (`en`) has **no URL prefix**: `/`, `/projects`, `/about`
- Non-default locales are prefixed: `/es/`, `/pt/`
- Translations live in `src/i18n/ui.ts` — one flat key/value object per locale
- Key helpers in `src/i18n/utils.ts`:
  - `getLangFromUrl(url)` — extracts lang from URL
  - `useTranslations(lang)` — returns a `t(key)` function
  - `localizedPath(lang, path)` — generates the correct prefixed URL
  - `getAlternatePaths(path, lang)` — used for hreflang alternate links

Each locale has **mirrored page files**: `src/pages/index.astro`, `src/pages/es/index.astro`, `src/pages/pt/index.astro`. When adding a new page, create all three variants. ES and PT pages hardcode `const lang = 'es'` / `'pt'` rather than calling `getLangFromUrl`.

### Content collections (`src/content.config.ts`)

- `projects` — MDX files at `src/content/projects/{locale}/{slug}.mdx`. Schema requires `locale`, `translationKey` (links translations of the same project across locales), `status`, `featured`, `stack`, `role`, `year`.
- `posts` — defined but unused (no content directory, no pages).

To add a project: create the MDX file in each locale subdirectory with the same `translationKey`.

### Styling

Tailwind v4 configured via `@tailwindcss/vite` Vite plugin (no `tailwind.config.js`). Theme tokens are defined as OKLCH CSS custom properties in `src/styles/globals.css` using `@theme`. UI primitives are shadcn-style components in `src/components/ui/` using CVA + Radix UI.

### ClientRouter (View Transitions)

`<ClientRouter />` from `astro:transitions` is in `BaseLayout.astro`. Two known behaviors to keep in mind:
1. **Theme persistence**: The `applyTheme()` function in `BaseLayout.astro` runs on both initial load and `astro:after-swap` — this is intentional. Do not simplify it back to a one-time script.
2. **Smart header**: `Header.astro` includes a bundled `<script>` that listens to `astro:page-load` to re-register scroll listeners after each navigation. The scroll handler reads `document.body.dataset.navOpen` to pause while MobileNav is open.

### MobileNav ↔ Header communication

`Header.astro` pre-computes `langLinks` (array of `{code, label, href, current}`) and passes them as props to `MobileNav`. The MobileNav sheet contains language switcher + theme toggle for mobile; the header shows them only on desktop (`hidden md:flex`). When the sheet opens, `document.body.dataset.navOpen = "true"` is set to block the scroll-hide behavior.

## Key files

| File | Purpose |
|---|---|
| `src/layouts/BaseLayout.astro` | Root HTML shell, ClientRouter, theme script |
| `src/i18n/ui.ts` | All translation strings for en/es/pt |
| `src/content.config.ts` | Zod schemas for content collections |
| `src/components/site/Header.astro` | Nav, smart scroll script, lang/theme controls |
| `src/components/site/MobileNav.tsx` | Sheet with nav + lang + theme (mobile) |
| `docs/ux-audit.md` | Prioritised UX/a11y backlog (not served) |
