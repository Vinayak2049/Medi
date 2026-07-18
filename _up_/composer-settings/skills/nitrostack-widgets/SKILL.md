---
name: nitrostack-widgets
description: >-
  Build interactive React widget UIs for MCP tools with `@nitrostack/widgets`.
  Use when the user adds or edits files under `src/widgets/`, wires a tool to
  a React route via `@Widget`, uses `useWidgetSDK`, `getToolOutput`,
  `getToolInput`, `callTool`, `useWidgetState`, `useTheme`, `useMaxHeight`,
  `useDisplayMode`, `defineWidgetMetadata`, or edits `widget-manifest.json`
  for Studio previews. Works with both the OpenAI Apps SDK and the MCP Apps
  spec.
---

# `@nitrostack/widgets`

React SDK for the UI that renders alongside an MCP tool result inside the host
(NitroStudio, ChatGPT, any MCP Apps host). The SDK auto-bridges OpenAI Apps
SDK (`window.openai`) and MCP Apps (`window.__MCP_APP_CONTEXT__`).

Source: `typescript/packages/widgets/src/`.

## Project layout

Widgets live in their **own Next.js project** under `src/widgets/`:

```
src/widgets/
├── package.json                # Separate deps: react, react-dom, @nitrostack/widgets
├── tsconfig.json
├── app/
│   └── <route>/page.tsx        # One folder per @Widget route
├── components/                 # Shared React components
└── widget-manifest.json        # Examples for Studio previews
```

Crucially, **server code (`src/index.ts`, modules) must not import from
`src/widgets/`** — they are built independently.

## The 30-second pattern

A widget is a React component that:
1. Calls `useWidgetSDK()` to read live data and host capabilities.
2. Renders the tool output.
3. Optionally calls another tool with `callTool(name, args)`.

```tsx
'use client';
import { useWidgetSDK } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';   // disable SSG; widgets are dynamic

interface Book { id: string; title: string; author: string; }

export default function BookCardWidget() {
  const { isReady, getToolOutput, theme, callTool } = useWidgetSDK();
  const book = getToolOutput<Book>();

  if (!isReady || !book) return <div>Loading…</div>;

  return (
    <article style={{ background: theme === 'dark' ? '#111' : '#fff' }}>
      <h2>{book.title}</h2>
      <p>{book.author}</p>
      <button onClick={() => callTool('list_books', {})}>See more</button>
    </article>
  );
}
```

The server side hooks this into a tool via `@Widget('book-card')` —
the route in `@Widget(...)` must equal the folder name under
`src/widgets/app/`.

## `useWidgetSDK()` return value

| Field | Purpose |
|---|---|
| `sdk` | The raw `WidgetSDK` instance |
| `isReady` | `true` once host is connected |
| `toolOutput` | Reactive tool output (re-renders on update) |
| `toolInput` | Reactive tool input |
| `theme` | `'light' \| 'dark'` |
| `maxHeight` | Number, host iframe ceiling |
| `displayMode` | `'inline' \| 'fullscreen' \| 'pip'` |
| `getToolOutput<T>()` | Imperative read (typed) |
| `getToolInput<T>()` | Imperative read of the tool args |
| `getOutput<T>()` / `getToolResponseMetadata()` | Lower-level reads |
| `getTheme()` / `getMaxHeight()` / `getDisplayMode()` | Imperative |
| `getUserAgent()` / `getLocale()` / `getSafeArea()` | Host info |
| `setState(s)` / `getState()` | Persistent widget state via host |
| `callTool(name, args)` | Invoke any MCP tool, get the response |
| `requestFullscreen()` / `requestInline()` / `requestPip()` / `requestDisplayMode(m)` / `requestClose()` | Display controls |
| `openExternal(url)` | Open URL in host browser |
| `sendFollowUpMessage(text)` | Push a follow-up user message |
| `isDarkMode()` | Convenience |

## Standalone hooks (use as needed)

| Hook | Purpose |
|---|---|
| `useTheme()` | Light/dark from host (reactive) |
| `useMaxHeight()` | Host iframe max height (reactive) |
| `useDisplayMode()` | Inline/fullscreen/pip (reactive) |
| `useWidgetState<T>(initial)` | Per-widget persisted state, host-stored |
| `useOpenAiGlobal(key)` | Low-level reactive subscribe to an OpenAI global |

## Media-query utilities (non-hook)

```ts
import { prefersReducedMotion, isPrimarilyTouchDevice, isHoverAvailable, prefersDarkColorScheme }
  from '@nitrostack/widgets';
```

Each is a function (or boolean accessor) intended for adaptive UI decisions.

## `defineWidgetMetadata` — Studio previews

The widget manifest powers the Studio preview gallery and runtime example
swaps. Every widget folder should export a `metadata` object.

```ts
// src/widgets/app/book-card/page.tsx (end of file)
import { defineWidgetMetadata } from '@nitrostack/widgets';

export const metadata = defineWidgetMetadata({
  uri: '/book-card',
  name: 'Book card',
  description: 'Single book detail rendered from get_book',
  examples: [
    {
      name: 'Seed — Mythical Man-Month',
      description: 'Matches bk-1 in library.data seed list',
      data: { id: 'bk-1', title: 'The Mythical Man-Month', author: 'Brooks' },
    },
    {
      name: 'Seed — DDIA',
      description: 'Second example so Studio can switch payloads',
      data: { id: 'bk-2', title: 'Designing Data-Intensive Applications', author: 'Kleppmann' },
    },
  ],
  tags: ['library', 'book'],
});
```

Mirror these examples into `src/widgets/widget-manifest.json` so Studio can
read them even before the bundle is loaded:

```json
{
  "version": "1.0.0",
  "widgets": [
    {
      "uri": "/book-card",
      "name": "Book card",
      "description": "Single book detail rendered from get_book",
      "examples": [
        { "name": "Seed — Mythical Man-Month", "description": "Matches bk-1", "data": { "id": "bk-1", "title": "The Mythical Man-Month", "author": "Brooks" } }
      ],
      "tags": ["library", "book"]
    }
  ],
  "generatedAt": "2026-05-19T00:00:00.000Z"
}
```

Keep the manifest examples a strict superset of (or equal to) the in-file
`metadata.examples`. The build step (or Studio) reads whichever is present.

> [!IMPORTANT]
> **Hard Guideline: Widget Manifest is Mandatory**
> Whenever you create or modify a widget UI folder under `src/widgets/app/`, you MUST also write/update `src/widgets/widget-manifest.json` with the exact same URI, details, examples, and tags. Do not skip this step — missing manifest entries will cause the widget rendering previews to timeout or stay in loading skeletons inside the host environment.

## Backward-compat: `withToolData`

```ts
import { withToolData, type ToolOutputWrapper } from '@nitrostack/widgets';

export default withToolData<Book>((book) => <BookCard {...book} />);
```

`withToolData` wraps a component, injects the tool output as props, and
handles the loading state. Use it when the widget is purely a function of
the tool output and you don't need `callTool` / display controls.

## `WidgetLayout` runtime component

```tsx
import { WidgetLayout } from '@nitrostack/widgets';

<WidgetLayout>{children}</WidgetLayout>
```

Provides theme-aware container styling and respects `useMaxHeight()`.

## Required rules

- Always start widget files with `'use client';` and
  `export const dynamic = 'force-dynamic';`.
- The `@Widget('<route>')` value on the server side **must equal** the
  folder name under `src/widgets/app/`.
- Never `console.log` data flowing through MCP; widgets run in the host
  iframe and the dev console can leak to the user.
- Widgets must work with no data initially — render a Loading/empty state.
- Type `getToolOutput<T>()` and validate before rendering.
- Do not import server-only modules from inside `src/widgets/`.

## Reference

For the full type and hook signatures, see [reference.md](reference.md).
