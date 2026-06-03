# Análisis UX/UI del Portfolio

## Context

Auditoría UX/UI del portfolio Astro en `C:\Users\billy\Documents\Portfolio\my-portfolio`. El usuario solicitó "analizar mejoras sobre el site" desde la perspectiva de un experto UX/UI. Este documento es **análisis-solamente** (no implementación), priorizado por impacto en el usuario final (visitante del portfolio: reclutadores, clientes potenciales, desarrolladores).

El stack actual es sólido: Astro 6 + React 19 + Tailwind v4 + shadcn-style primitives + i18n (en/es/pt) + ClientRouter (View Transitions) + sonner instalado pero sin usar. Lo que sigue son los problemas detectados, agrupados por severidad.

---

## P0 — Bloqueadores funcionales (rompen la experiencia)

### 1. El formulario de contacto está roto silenciosamente
- `src/pages/contact.astro` (y `es/`, `pt/`) hace `POST /api/contact`, pero `astro.config.mjs` está en `output: 'static'` y **no existe ningún endpoint** en `src/pages/api/`. En producción (Azure SWA) cualquier envío termina en 404 sin feedback alguno.
- No hay handler JS, ni pending state, ni toast, ni mensaje inline. El visitante hace clic en "Enviar" y aparentemente nada cambia.
- **Impacto**: para un portfolio freelance, perder leads en silencio es el peor escenario posible.
- **Recomendación**: implementar el endpoint (Resend/SendGrid/Formspree, o switch a SSR) + handler React que use `toast.success/error` con sonner. Añadir un `mailto:` como fallback redundante.

### 2. Datos placeholder publicados en `/about`
- `Your Name`, `yourusername`, `yourprofile`, `UTC-X` aparecen en las 3 variantes de idioma, además del `personSchema` JSON-LD.
- El comentario `TODO: update with your real data` está en producción.
- **Impacto**: rompe la confianza inmediatamente. Un reclutador asume sitio abandonado.
- **Recomendación**: reemplazar con datos reales antes de cualquier otra mejora visual.

### 3. Asimetría de contenido entre idiomas
- ES `/about` no tiene la sección "How I work" que existe en EN.
- 404 solo existe en EN; rutas inválidas en `/es/*` caen al 404 inglés.
- **Recomendación**: si las traducciones aún no están listas, ocultar el switcher en rutas sin traducción o redirigir a EN con aviso, en lugar de mostrar paridad incompleta.

---

## P1 — Friction UX importante

### 4. Falta feedback en interacciones críticas
- **Toaster nunca montado**: `sonner` está instalado y configurado pero `<Toaster />` no se renderiza en `BaseLayout.astro`. Toda la infraestructura de notificaciones está muerta.
- **ThemeToggle flashea el icono incorrecto** antes de hidratarse (inicia `isDark=false`, lee la clase real solo en `useEffect`). Visible en cada page-load si el modo es dark.
- **MobileNav sin `SheetTitle`/`SheetDescription`**: Radix emite warning de a11y y los screen readers reciben un dialog sin nombre.
- **Recomendación**: montar Toaster en BaseLayout; inicializar ThemeToggle leyendo `documentElement.classList` antes del primer render (vía `useSyncExternalStore` o estado inicial calculado); añadir SheetTitle con `sr-only` si no se quiere mostrar visualmente.

### 5. LanguageSwitcher pierde contexto
- Al cambiar idioma desde `/projects/event-driven-platform`, asume que el slug es idéntico en todos los idiomas. Si en algún momento se localizan slugs, romperá silenciosamente.
- No hay manejo cuando la ruta destino no existe (ej. PT projects vacío).
- **Recomendación**: usar `getAlternatePaths` que ya existe en `i18n/utils.ts` para enlazar a la URL real de cada idioma; si no hay traducción, deshabilitar visualmente la opción con tooltip "Translation pending".

### 6. Touch targets debajo del estándar WCAG
- `Button` default es `h-8` (32px), `icon` es `size-8` — WCAG 2.5.5 recomienda 44px mínimo.
- ThemeToggle, MobileNav trigger, y los pills del LanguageSwitcher (`px-2 py-1`) son todos demasiado pequeños en móvil.
- **Recomendación**: introducir una variante `size="touch"` o aumentar el default a `h-10 sm:h-9` para los controles del header.

### 7. Cero motion en una página que ya tiene ClientRouter
- `ClientRouter` está activo pero ninguna página define `transition:name` o `transition:animate`. Los cambios de página son cross-fade genérico.
- Hero, FeaturedProjects, ProjectCard grid no tienen entrada animada (stagger, fade-in-up).
- `tw-animate-css` está importado pero apenas se usa.
- **Recomendación**: añadir `transition:name="hero-title"` y `transition:name="project-card-{slug}"` para morph entre index → detail. Un stagger sutil con `tw-animate-css` en el grid de proyectos da percepción de calidad sin esfuerzo.

---

## P2 — Pulido / accesibilidad fina

### 8. Accesibilidad: detalles que faltan
- No hay "Skip to main content" link; usuarios de teclado deben tabular por todo el header en cada navegación.
- `<main>` no tiene `id` ni `tabindex="-1"` para focus management tras navegación SPA del ClientRouter.
- Hero `<section>` sin `aria-labelledby` apuntando al h1.
- ThemeToggle no tiene `aria-pressed` (es un toggle, no un button normal).
- LanguageSwitcher: `aria-current="true"` — validar si debe ser `aria-current="page"` según WAI-ARIA.
- Los links de footer/header dependen del outline default del navegador; `outline-ring/50` del layer base es muy sutil.

### 9. Jerarquía visual: oportunidades
- **Header logo `<billy-arredondo />`** compite con el h1 por atención. Considerar tipografía mono más discreta para el wordmark.
- **TechStack** (15 badges idénticas en color) es ruido visual sin jerarquía. Sugerir: agrupar por categoría (Backend / Frontend / Cloud) con subtítulos, o destacar 3-4 "core" con tratamiento distinto.
- **Hero** carece de una pieza visual (avatar, ilustración, foto). Es 100% texto sobre fondo sólido — funciona pero pierde memorabilidad.
- **FeaturedProjects** cap en 3 pero solo hay 1 proyecto total: la sección se ve escasa.
- Paleta 100% grayscale es consistente, pero un acento de color en CTAs primarios diferenciaría del template shadcn default.

### 10. Estados vacíos y de error
- Empty state de proyectos es solo texto plano. Oportunidad: ilustración SVG + CTA secundario ("Ver mi GitHub mientras tanto").
- 404 es genérico; podría reflejar la personalidad del portfolio (terminal-style).
- Form de contacto no tiene validación inline ni contador de caracteres en el textarea.

### 11. Tipografía y ritmo
- No hay `max-w-prose` definido para body copy en `/about` — líneas largas en monitores anchos.

### 12. Detalles del ClientRouter
- Página entera hace cross-fade incluyendo el Header sticky → parpadea innecesariamente. Añadir `transition:persist` a `<Header>` y `<Footer>` para que solo `<main>` transicione.
- Esto también elimina la re-hidratación de `ThemeToggle` y `MobileNav` en cada navegación.

---

## Recomendaciones priorizadas (orden sugerido de ejecución)

| # | Acción | Severidad | Esfuerzo |
|---|---|---|---|
| 1 | Implementar endpoint `/api/contact` + feedback con sonner | P0 | M |
| 2 | Reemplazar todos los placeholders en `/about` y JSON-LD | P0 | S |
| 3 | Resolver asimetría EN/ES/PT (ocultar idiomas sin contenido o completar traducciones) | P0 | M |
| 4 | Montar `<Toaster />` en BaseLayout | P1 | S |
| 5 | Fix flash de ThemeToggle pre-hidratación | P1 | S |
| 6 | Añadir `SheetTitle` (sr-only) a MobileNav | P1 | S |
| 7 | `transition:persist` en Header/Footer + `transition:name` en ProjectCard → detail | P1 | M |
| 8 | Skip-to-content link y focus management en `<main>` | P2 | S |
| 9 | Aumentar touch targets en header (h-10 móvil) | P2 | S |
| 10 | Reorganizar TechStack por categorías | P2 | M |
| 11 | Estado vacío de proyectos con ilustración + CTA secundario | P2 | M |
| 12 | Acento de color para CTAs primarios (diferenciar de shadcn default) | P2 | S |

---

## Critical files referenced

- `src/pages/contact.astro` (+ `es/`, `pt/`) — formulario roto
- `src/pages/about.astro` (+ `es/`, `pt/`) — placeholders sin reemplazar
- `src/layouts/BaseLayout.astro` — toaster faltante, sin transition:persist
- `src/components/site/Header.astro`, `Footer.astro` — candidatos a `transition:persist`
- `src/components/site/ThemeToggle.tsx` — flash de hidratación, falta `aria-pressed`
- `src/components/site/MobileNav.tsx` — falta `SheetTitle`
- `src/components/site/LanguageSwitcher.astro` — usar `getAlternatePaths` real
- `src/components/home/TechStack.astro` — agrupar por categorías
- `src/components/projects/ProjectCard.astro` — añadir `transition:name`
- `src/content/projects/` — falta paridad PT
- `src/pages/api/contact.*` — **no existe, hay que crearlo**
- `src/i18n/utils.ts` — ya tiene `getAlternatePaths`, infrautilizado

## Verification (cuando se ejecute la implementación)

1. Llenar el form de contacto en EN/ES/PT y confirmar que llega un email + se muestra toast de éxito.
2. Cambiar idioma en `/projects/event-driven-platform` y verificar que aterriza en la URL traducida correcta.
3. Navegar entre páginas con DevTools → Application → Local Storage para confirmar persistencia de tema y que no hay flash.
4. Tab por todo el sitio sin mouse: skip-link visible al primer tab, focus ring claro en cada control, MobileNav anunciado por screen reader con título.
5. Lighthouse Mobile: confirmar a11y ≥ 95, touch targets sin warnings.
6. Reducir motion en SO → confirmar que las animaciones respetan `prefers-reduced-motion`.
