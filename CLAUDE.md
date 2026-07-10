# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing website for **Laborite Estética Dental**, a fictitious digital dental-prosthetics lab. This is a **portfolio demo** — the brand name and all contact data (WhatsApp, e-mail, Instagram) are fake and must stay fake. Pure HTML/CSS/JS — no build step, no package manager, no framework. All third-party libraries load from CDNs at runtime. Content is in Brazilian Portuguese (`lang="pt-BR"`).

## Running / previewing

There is no build or test command. Serve the folder with any static server and open in a browser, e.g.:

```powershell
python -m http.server 8000   # then open http://localhost:8000
```

Opening the HTML files directly via `file://` mostly works, but ES-module dynamic imports (anime.js in `setupAnimeTimeline`) and CDN scripts need an `http://` origin to behave correctly, so prefer a local server.

## Page structure

Five sibling pages at the repo root, each fully self-contained with duplicated `<header>` nav and `<footer>`:

- `index.html` — home. Unique: `<body class="home-v2 home-atelier">` and it additionally loads **Lenis** (smooth scroll) CSS + JS, which the other pages do not.
- `laboratorio.html`, `servicos.html`, `portfolio.html`, `contato.html` — interior pages, `<body>` with no class, using the generic `.page-shell` / `.page-hero` / `.section` layout.

There is no templating: editing the nav, footer, or shared `<head>` means **applying the same change to all five files**. The active nav link is marked per-page with `class="is-active"`.

## JS architecture (`js/main.js`)

A single non-module script, loaded with `defer` on every page. `initLaboriteSite()` runs all setup functions; each one queries for the elements it needs and **no-ops if they aren't present**, so the same script is safe to include on every page. Behavior is wired through `data-*` attributes rather than per-page scripts:

- `data-whatsapp` → href set to `WHATSAPP_URL` (the canonical WhatsApp link + number live at the top of `main.js`).
- `data-email` → `mailto:` to `EMAIL` (also defined at top of `main.js`).
- `data-year` → current year text.
- `data-contact-form` → on submit, builds a `mailto:` with the form fields (no backend; the contact form opens the user's mail client).
- `data-filter` / `data-category` → portfolio gallery filtering.
- `data-parallax` → GSAP scroll parallax target.

To change the WhatsApp number or contact email site-wide, edit the `WHATSAPP_URL` / `EMAIL` constants in `main.js` — nowhere else.

## Animation & the `.reveal` gotcha

Animation libs are loaded from CDN: **GSAP + ScrollTrigger** (script tags) and **anime.js** (dynamic ESM import). Smooth scroll via **Lenis** (home only).

`.reveal` elements default to `opacity: 0` in CSS. They become visible only when JS runs:
- normal path: GSAP ScrollTrigger fades them in as they scroll into view;
- reduced-motion **or** GSAP failing to load: `main.js` adds `is-loaded` to `<body>`, and `.is-loaded .reveal` makes them visible.

Consequence: if you add a `.reveal` element and JS is broken/blocked, the content stays invisible. Everything respects `prefers-reduced-motion` (checked once as `prefersReducedMotion` in `main.js`); motion-heavy setups bail out under it.

## Styling (`css/styles.css`)

Single ~1900-line stylesheet, no preprocessor. Design tokens are CSS custom properties in `:root` (brand teal `--brand: #166595`, type scale, `--container`, easing). Fonts (Cormorant Garamond + Manrope) are `@import`ed from Google Fonts at the top.

Structure: shared component/layout rules first, then page-specific overrides scoped under the home body classes — `.home-v2 …` (~line 1191) and `.home-atelier …` (~line 1792). When restyling the home page, prefer these scoped blocks so interior pages are unaffected.

## Images

`img/` holds the photo gallery as `.webp` files with opaque Instagram-style hashed filenames (`imgi_NN_…webp`) — names are not semantic, so identify images by where they're referenced in the HTML. The favicon is the root-level `favicon.svg` (there are no logo image files; the header brand is inline SVG + text).

The root-level `*.png` screenshots (e.g. `home-v2-desktop.png`) and `.chrome-*/` directories are throwaway preview/screenshot artifacts, not part of the site.
