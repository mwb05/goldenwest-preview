# Golden West Tire Centers — Static Site

Rebuild of goldenwesttires.com (previously a Hostinger Website Builder site). Five pages, one
stylesheet, one small JS file, no frameworks, no build step. Content is verbatim from the old site
(see `../_source/content-inventory.md`) with source typos fixed.

## What's here

| File | Page |
|---|---|
| `index.html` | Home — hero, stats band, services preview, careers pitch, 4 testimonials |
| `services.html` | 6 service cards, testimonial band, locations CTA |
| `about.html` | Big O Tires story, 6-value grid |
| `careers.html` | ADP apply CTA, 6 role cards, benefits checklist |
| `locations.html` | 17 store cards (4 Bakersfield + 13 SoCal), two Google My Maps embeds, per-store JSON-LD |
| `css/style.css` | Shared stylesheet (Nunito, monochrome + Big O red `#ED0C0E`/`#B8001F`) |
| `js/main.js` | Mobile nav toggle only |
| `favicon.svg` | New "GW" mark (the old site shipped no favicon) |
| `assets/` | Optimized images (heroes ≤2000px, content photos ≤1200px, JPEG q78 — ~11MB → ~2.5MB) |

## Before launch — action items

1. **Contact form is a placeholder.** Every page's footer form posts to
   `https://formspree.io/f/PLACEHOLDER`. Create a free form at formspree.io (point it at whatever
   email should receive inquiries — the old Hostinger form's destination email was never exposed),
   then find-and-replace `PLACEHOLDER` with the real form ID across all five HTML files.
2. **Verify two phone numbers.** Huntington Beach shows **(310) 972-0776** and Chino
   **(323) 566-3797** — both area codes are unusual for those cities. They're carried over verbatim
   from the old site and flagged with HTML comments in `locations.html`. Confirm with the stores.
3. **Domain is goldenwesttires.com — two t's.** All canonical URLs, og:urls, and og:images point
   there. (This working folder is named `goldenwestires` with one t; the deployed domain must be
   the two-t version. `goldenwestires.com` does not resolve.)

## Other notes

- The old site's heading claimed 18 stores but only listed 17 location cards (4 Bakersfield +
  13 SoCal). Confirmed 2026-08-15: 17 is correct. All copy now says 17.
- The two Google My Maps embeds were carried over. Which embed covers which region wasn't labeled
  in the old markup; the first (`...bkCGj5Qg`) sits above Bakersfield and the second
  (`...YqL2kGEk`) above Southern California — swap the iframe `src` values if they render reversed.
- Bakersfield phone-to-store pairings were inferred from listing order in the old HTML — worth a
  quick double-check.
- Fixed from source: "Big-0-Tires" (zero) alt text, unclosed parentheses in two benefits bullets,
  the double-space/stray-comma meta description, the stock-photo leftover alt text, and the stale
  "© 2024" (now © 2026).

## Deploy

Any static host works — Hostinger's plain static hosting, Cloudflare Pages, Netlify, GitHub Pages,
etc. Upload the contents of this `site/` folder as the web root (no build step, no server code) and
point the `goldenwesttires.com` DNS A/CNAME records at the new host; DNS itself can stay registered
at Hostinger. The Google Fonts link and Formspree POST are the only external dependencies.
