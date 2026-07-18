# `@nitrostack/widgets` — reference

Source of truth: `typescript/packages/widgets/src/index.ts`.

## Public exports

```ts
// SDK
WidgetSDK, getWidgetSDK
WidgetLayout
type WidgetLayoutProps

// Backward-compat helpers
withToolData
type ToolOutputWrapper
defineWidgetMetadata
type WidgetMetadata, WidgetExample, WidgetManifest

// Hooks (OpenAI Apps SDK + MCP Apps compatible)
useOpenAiGlobal, useWidgetState, useTheme, useMaxHeight, useDisplayMode, useWidgetSDK

// Media-query utilities
prefersReducedMotion, isPrimarilyTouchDevice, isHoverAvailable, prefersDarkColorScheme

// Shared types
type UnknownObject, Theme, SafeAreaInsets, SafeArea, DeviceType, UserAgent
type DisplayMode, RequestDisplayMode
type CallToolResponse, CallTool
type OpenAiGlobals, OpenAiAPI, SetGlobalsEvent
type McpAppContext, McpAppAPI
SET_GLOBALS_EVENT_TYPE
```

## `useWidgetSDK()` return type

```ts
{
  sdk: WidgetSDK;
  isReady: boolean;

  // Reactive data (re-render on change)
  toolOutput: unknown;
  toolInput: unknown;
  theme: 'light' | 'dark' | null;
  maxHeight: number | null;
  displayMode: DisplayMode | null;

  // State
  setState: (state: Record<string, unknown>) => Promise<void>;
  getState: () => Record<string, unknown> | null;

  // Calls
  callTool: (name: string, args?: Record<string, unknown>) => Promise<CallToolResponse>;

  // Display controls
  requestFullscreen: () => Promise<void>;
  requestInline: () => Promise<void>;
  requestPip: () => Promise<void>;
  requestDisplayMode: (mode: RequestDisplayMode) => Promise<void>;
  requestClose: () => Promise<void>;

  // Navigation
  openExternal: (url: string) => Promise<void>;
  sendFollowUpMessage: (text: string) => Promise<void>;

  // Imperative readers
  getToolInput: <T = unknown>() => T | null;
  getToolOutput: <T = unknown>() => T | null;
  getOutput: <T = unknown>() => T | null;
  getToolResponseMetadata: () => Record<string, unknown> | null;
  getTheme: () => 'light' | 'dark' | null;
  getMaxHeight: () => number | null;
  getDisplayMode: () => DisplayMode | null;
  getUserAgent: () => UserAgent | null;
  getLocale: () => string | null;
  getSafeArea: () => SafeArea | null;

  // Convenience
  isDarkMode: () => boolean;
}
```

## `WidgetSDK` class

`getWidgetSDK()` returns the singleton. Methods mirror the hook return
above and add:

```ts
class WidgetSDK {
  static getInstance(): WidgetSDK;
  isReady(): boolean;
  isOpenAI(): boolean;
  isMcpApps(): boolean;
  waitForReady(timeoutMs?: number): Promise<void>;
}
```

`isOpenAI()` / `isMcpApps()` let widgets adapt to host quirks without
breaking compatibility.

## `defineWidgetMetadata` shape

```ts
interface WidgetMetadata {
  uri: string;                          // e.g. '/book-card'
  name: string;
  description: string;
  examples: WidgetExample[];
  tags?: string[];
}

interface WidgetExample {
  name: string;
  description: string;
  data: Record<string, any>;
}

interface WidgetManifest {
  version: string;
  widgets: WidgetMetadata[];
  generatedAt: string;
}
```

The function is identity-typed:

```ts
function defineWidgetMetadata(metadata: WidgetMetadata): WidgetMetadata;
```

Its purpose is purely the type-check; mirror the values into
`src/widgets/widget-manifest.json` for host consumers that don't load the
bundle first.

## Hook signatures

```ts
function useOpenAiGlobal<K extends keyof OpenAiGlobals>(key: K): OpenAiGlobals[K];
function useWidgetState<T>(initial: T | (() => T)): [T, (next: T) => void];
function useTheme(): 'light' | 'dark' | null;
function useMaxHeight(): number | null;
function useDisplayMode(): DisplayMode | null;
```

## Display mode constants

`DisplayMode = 'inline' | 'fullscreen' | 'pip'`

`RequestDisplayMode` is the same plus the host may reject — always `await`
the promise and accept that it may resolve without changing mode.

## Working examples

The canonical reference widgets ship inside the CLI templates:

```
typescript/packages/cli/templates/typescript-pizzaz/src/widgets/
├── app/pizza-list/page.tsx       # uses useWidgetState, callTool, useMaxHeight
├── app/pizza-shop/page.tsx       # fullscreen request, detail view
├── app/pizza-map/page.tsx        # external library integration
└── components/PizzaCard.tsx      # shared layout component
```

Open them when designing a non-trivial widget — they cover loading states,
favorites, sorting, scroll snap, and host display-mode transitions.

## Compatibility matrix

| Host | Detection | Notes |
|---|---|---|
| OpenAI Apps SDK (ChatGPT) | `window.openai` present | SDK auto-uses it |
| MCP Apps spec | `window.__MCP_APP_CONTEXT__` present | Same SDK, transparent |
| NitroStudio | Either, depending on preview mode | Reads `widget-manifest.json` for offline examples |
