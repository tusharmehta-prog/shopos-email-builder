# ShopOS Email Builder

A browser-based transactional email builder for ShopOS — go from copy + brand assets to an upload-ready Loops zip in under 5 minutes.

![ShopOS Email Builder](https://img.shields.io/badge/built%20with-React%20%2B%20Vite-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## What it does

- **3 templates** — Transactional, Announcement, Lifecycle with ShopOS-voice defaults
- **Live preview** — 300ms debounced iframe render, desktop + mobile viewports
- **Inbox mockup** — see exactly how subject + preview text look in Gmail
- **Rich text editing** — bold, italic, links, per-paragraph alignment, merge tags
- **Style controls** — hero bg, card bg + corner radius, CTA button color/radius, theme presets
- **Logo upload** — PNG with transparent bg, alignment + size controls
- **Social follow buttons** — Twitter/X, LinkedIn, Instagram, Facebook, TikTok
- **Callout block** — toggleable highlight box with radius control
- **Copy guardrails** — warns on em dashes, banned phrases, subject line length
- **Preflight checklist** — 9-item pass/warn/fail before you send
- **Export** — Downloads `{slug}.zip` containing `index.mjml` with UTM params auto-appended
- **Copy HTML / Copy MJML** — one-click clipboard copy
- **Plain text view** — auto-generated plain text version
- **Autosave** — drafts persist to localStorage

## Stack

| | |
|---|---|
| Framework | React 18 + Vite 5 |
| Language | TypeScript 5 |
| Zip export | JSZip |
| Icons | lucide-react |
| Output format | MJML (string generation) |
| Email platform | [Loops.so](https://loops.so) compatible |

## Getting started

```bash
git clone https://github.com/tusharmehta-prog/shopos-email-builder.git
cd shopos-email-builder
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Export format

Downloads a zip containing `index.mjml` — upload directly to Loops or compile with the [MJML CLI](https://mjml.io/documentation/#installation).

UTM parameters (`utm_source=loops&utm_medium=email&utm_campaign={slug}`) are automatically appended to the CTA URL on export.

## Loops compatibility

- `{unsubscribe_link}` token is pre-populated in the footer and warned if removed
- MJML structure follows Loops' recommended patterns
- Subject line hints and copy guardrails enforce Loops-style tone

## Project structure

```
src/
├── components/
│   ├── CopyEditor.tsx      # Left panel — content fields
│   ├── StylePanel.tsx      # Left panel — style controls
│   ├── Preview.tsx         # Right panel — live preview + export
│   ├── RichParagraph.tsx   # Contenteditable rich text with toolbar
│   ├── TemplatePicker.tsx  # Template switcher (3 types)
│   └── LogoUpload.tsx      # PNG drag-and-drop upload
├── lib/
│   ├── renderer.ts         # Generates preview HTML from EmailData
│   ├── export.ts           # Generates MJML + zip download
│   ├── templates.ts        # Template defaults per type
│   └── guardrails.ts       # Copy quality checks
├── types.ts                # EmailData interface + shared types
└── App.tsx                 # Root layout + state
```

## License

MIT
