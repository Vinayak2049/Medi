---
name: design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use when building or styling widget pages, MCP UI surfaces, dashboards, or any React UI in Compose — especially under src/widgets/app/. Prefer polished typography and custom styling; avoid Tailwind CSS inside widgets to prevent missing configuration or dependency issues.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## NitroStack widgets (Compose)

When editing `src/widgets/app/<route>/page.tsx`:

1. Call `skill-read` on `design` (this skill) before your first widget UI pass in a session.
2. Avoid Tailwind CSS inside widgets because user projects might not have Tailwind CSS dependencies or configurations set up properly.
3. Use Vanilla CSS or CSS Modules (e.g. creating a `<name>.module.css` file alongside your component) and standard inline styles (`style={{...}}`) for all styling. This guarantees that styling works out-of-the-box in any project.
4. Respect `useTheme()` / `useMaxHeight()` from `@nitrostack/widgets` for light/dark and density.

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS keyframe animations and transitions. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: You are capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

---

# Concrete design system (apply to every widget)

The guidance above sets the creative direction. The rules below are the non-negotiable mechanics that separate a designed UI from a "vibe-coded" one. Follow them on every widget unless the aesthetic direction deliberately overrides a specific item.

## 1. Typography

- **Pair two fonts**: one distinctive display/heading font + one highly-legible body font. Load them from Google Fonts in the widget page (e.g. a `<link>` in the page or a `next/font` import) — do not rely on system defaults.
- **Banned defaults**: never ship Inter, Roboto, Arial, Helvetica, or raw `system-ui` as the primary typeface. They read as unstyled. (System stacks are fine only as a last-resort fallback in the `font-family` list.)
- **Type scale** (use these, don't invent random sizes):
  - 12px (tiny/captions)
  - 14px (small/body secondary)
  - 16px (base/body primary)
  - 18px (large/subheadings)
  - 20px (extra large)
  - 24px (heading 3)
  - 30px (heading 2)
  - 36px (heading 1)
  Pick 3-4 steps per widget, not all of them.
- **Weight + tracking**: headings should be weight `600`/`700` with `letter-spacing: -0.025em`; body should be weight `400` with default tracking; tiny labels `text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px; font-weight: 500`.
- **Line-height**: tight (`line-height: 1.25`) for large headings, relaxed (`line-height: 1.625`) for paragraphs. Never set it to `none` on multi-line text.
- **Numbers**: use `font-variant-numeric: tabular-nums` for stats, prices, and any aligned figures.

## 2. Spacing & layout (4px grid)

- All spacing comes from the 4px scale: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`. Don't use arbitrary spacing values like `13px`.
- **Card padding**: `16px` (compact) to `24px` (comfortable). **Gaps between cards**: `12px`/`16px`. **Section spacing**: `24px` (using margins or flex/grid gap).
- Establish hierarchy with **whitespace first**, borders second. Avoid boxing everything in.
- Constrain measure: body copy max ~`65ch` (max-width). Don't let text run edge-to-edge in wide widgets.
- Respect `useMaxHeight()` — make lists scroll inside the widget rather than overflowing the host.

## 3. Color

- Drive color from **CSS variables**, not hardcoded hexes scattered through markup. Define a small palette: `--bg`, `--surface`, `--border`, `--fg`, `--muted`, `--accent`.
- **One dominant accent** + neutrals. Accent appears on ~10% of the surface (primary action, key metric, active state), not everywhere.
- Respect `useTheme()` for light/dark — supply both palettes; never assume a white background.
- **Banned cliché**: purple-to-blue gradients on white. If you use a gradient, make it intentional and on-brand.
- Contrast: body text must hit WCAG AA against its surface. Muted text uses the `--muted` token, not low-opacity guesses.

## 4. Component recipes

Define these in your CSS Module (e.g. `page.module.css`) or via clean inline styles. Use `lucide-react` for icons.

- **Card**:
  ```css
  .card {
    border-radius: 16px;
    border: 1px solid var(--border);
    background-color: var(--surface);
    padding: 20px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  }
  ```
- **Badge / pill**:
  ```css
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-radius: 9999px;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 500;
    background-color: rgba(var(--accent-rgb), 0.1);
    color: var(--accent);
  }
  ```
- **Button**:
  ```css
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 8px;
    padding: 0 16px;
    height: 36px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.15s ease-out;
    cursor: pointer;
    border: 1px solid transparent;
  }
  .buttonPrimary {
    background-color: var(--accent);
    color: #fff;
  }
  .buttonSecondary {
    border-color: var(--border);
    background-color: transparent;
    color: var(--fg);
  }
  ```
- **Stat tile**:
  ```css
  .statLabel {
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 12px;
    color: var(--muted);
  }
  .statValue {
    font-size: 30px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  ```
- **List row**:
  ```css
  .listRow {
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 8px;
    padding: 8px 12px;
    transition: background-color 0.15s;
  }
  .listRow:hover {
    background-color: var(--surface);
  }
  ```
- **Empty state**: centered column, muted icon (`lucide-react`, 40–48px), `font-size: 16px; font-weight: 600;` headline, `font-size: 14px; color: var(--muted);` subcopy explaining what happened.
- **Skeleton**: keyframe-based pulsate placeholder blocks that match the final layout, shown while `isReady`/data is pending.
  ```css
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }
  .skeleton {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    background-color: var(--border);
    border-radius: 4px;
  }
  ```

## 5. Imagery

- Widgets with entities (products, books, places, people) should **show images**. Seed/tool data includes `imageUrl` — render it.
- Use fixed aspect ratios (`aspect-ratio: 16 / 9` or `aspect-ratio: 1 / 1`) + `object-fit: cover` + `border-radius: 12px`. Never let raw images dictate layout.
- Always provide a fallback (initials block or icon) when `imageUrl` is missing, and `alt` text for accessibility.

## 5b. Empty / zero-result states (REQUIRED — not optional polish)

Tool output can legitimately be empty: no flights found, no search hits, no bookings yet. **Never render a blank widget or a bare "No data" string.** Treat empty results as a first-class UI state with the same design care as success.

Standard pattern (every list/search widget):
1. **Loading** — skeleton or spinner while `!isReady || !data`.
2. **Success with items** — the main UI.
3. **Success but empty array / null results** — dedicated empty state (icon + headline + helpful subcopy + optional CTA).
4. **Error / malformed payload** — friendly error card, not a stack trace.

Empty-state recipe (copy/adapt per domain):
- Centered column inside the card: muted icon (`lucide-react`, 40–48px), `font-size: 16px; font-weight: 600` headline, `font-size: 14px; color: var(--muted)` subcopy explaining what happened and what to try next.
- Example — flight search with zero results: icon `Plane`, headline "No flights found", subcopy "Try different dates or nearby airports.", optional button "Adjust search" calling `callTool` with refined args.
- Example — order history empty: icon `Inbox`, headline "No bookings yet", subcopy "Your completed bookings will appear here."

Rules:
- Distinguish **empty** (successful search, zero rows) from **error** (tool failed / bad payload) — different copy and color (neutral vs destructive).
- Empty states still respect `useTheme()` — soft surface background, not harsh red.
- Do NOT show raw JSON or debug `<pre>` for empty results in production widgets.

## 6. Motion

- Use CSS keyframes and transitions. Keep it tasteful: 150-300ms, `ease-out`.
- High-impact moment: one staggered entrance on load (`animation-delay` per item) beats scattered micro-interactions.
- Add hover/active feedback on every interactive element. Respect `prefers-reduced-motion`.

## 7. Do / Don't

DO:
- Commit to one aesthetic and execute it precisely.
- Reuse the recipes above so spacing/typography stay consistent within a widget.
- Add loading, empty, and error states (see the widget defensive-rendering rules).
- Style elements using CSS Modules or inline styling to make them project-independent.

DON'T:
- Use Tailwind CSS class names in widgets, as user projects might lack the styling configuration or dependencies.
- Ship unstyled gray boxes, default browser fonts, or bare `<table>`/`<ul>` with no styling.
- Use Inter/Roboto/Arial, purple-on-white gradients, or evenly-distributed timid palettes.
- Invent off-grid spacing, mix five font sizes, or scatter hardcoded hex colors.
- Let images, lists, or text overflow the widget's `useMaxHeight()` bounds.

## Pre-ship design checklist

- [ ] Widget styled using Vanilla CSS, CSS Modules, or inline styles (NO Tailwind CSS class names used)
- [ ] Distinctive display + body font pair loaded (no Inter/Roboto/Arial)
- [ ] 3-4 type-scale steps, consistent weights/tracking
- [ ] 4px-grid spacing; cards padding comfort; consistent gaps
- [ ] One accent + neutral palette via CSS vars; light AND dark via `useTheme()`
- [ ] Cards/badges/buttons use the CSS Module recipes; icons via `lucide-react`
- [ ] Entity images rendered with fixed aspect ratio + fallback
- [ ] Loading + **empty/zero-result** + error states present (empty ≠ error)
- [ ] One intentional load animation; hover states everywhere
