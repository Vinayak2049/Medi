---
name: nitrostack-cli
description: >-
  Use `@nitrostack/cli` (binary: `nitrostack-cli`) to scaffold, develop, build,
  start, and extend NitroStack MCP projects. Use when the user wants to create
  a new MCP project, run `nitrostack-cli init|dev|build|start|generate|install|upgrade`,
  pick a template, add a new tool/module/middleware/guard via the generator, or
  set up the local dev loop with widget hot reload.
---

# NitroStack CLI

The CLI is the entry point for any NitroStack project. Reach for it before
hand-writing boilerplate.

## Install once

```bash
npm install -g @nitrostack/cli
```

The installed binary is `nitrostack-cli` (also aliased as `@nitrostack/cli`).
All templates assume this name in their `package.json` scripts.

## Command surface

```bash
nitrostack-cli init <project-name> [--template <name>] [--description <text>] [--author <name>] [--skip-install]
nitrostack-cli dev   [--port <port>]
nitrostack-cli build [--output <path>]
nitrostack-cli start [--port <port>]
nitrostack-cli generate <type> [name] [--module <name>] [--output <path>] [--force] [--skip-related]
nitrostack-cli install [--skip-widgets] [--production]
nitrostack-cli upgrade [--dry-run] [--latest]
```

Aliases: `generate` → `g`, `install` → `i`.

## Templates (pick by use case)

| Template | When to use |
|---|---|
| `typescript-starter` | Default. Single-module calculator + widget. Best to learn. |
| `typescript-pizzaz` | Full demo: multiple widgets, tasks, follow-up tool calls. |
| `typescript-oauth` | OAuth 2.1 auth + protected resources. |

If the user does not specify, pick `typescript-starter`. Pass the flag
explicitly so the scaffold is deterministic.

## Scaffolding workflow

```
Task progress:
- [ ] Run `nitrostack-cli init <name> --template typescript-starter`
- [ ] `cd <name>` and confirm folder structure (see below)
- [ ] `npm run dev` to verify the MCP server + widget dev server boot
- [ ] Open NitroStudio (https://nitrostack.ai/studio) and connect to the local server
- [ ] Iterate using `nitrostack-cli generate ...` for new pieces
```

Resulting layout (starter):

```
<project>/
├── src/
│   ├── index.ts                 # Bootstrap via McpApplicationFactory
│   ├── app.module.ts            # @McpApp + @Module root
│   ├── modules/<feature>/       # *.tools.ts, *.resources.ts, *.prompts.ts, *.module.ts
│   ├── health/                  # @HealthCheck classes
│   └── widgets/                 # Next.js project for React widgets
│       ├── app/<route>/page.tsx # One folder per @Widget route
│       └── widget-manifest.json # Examples for Studio previews
├── package.json                 # Has nitrostack-cli {dev,build,start,upgrade,install}
└── tsconfig.json
```

## `generate` cookbook

`nitrostack-cli generate <type> <Name>` produces files under conventional paths.

| `<type>` | Output |
|---|---|
| `module <Name>` | `src/modules/<name>/<name>.module.ts` + sibling `tools/resources/prompts` skeletons (unless `--skip-related`) |
| `tools <Name> --module <m>` | `src/modules/<m>/<m>.tools.ts` |
| `resources <Name> --module <m>` | `src/modules/<m>/<m>.resources.ts` |
| `prompts <Name> --module <m>` | `src/modules/<m>/<m>.prompts.ts` |
| `middleware <Name>` | `src/middleware/<name>.ts` implementing `MiddlewareInterface` |
| `interceptor <Name>` | `src/interceptors/<name>.ts` |
| `pipe <Name>` | `src/pipes/<name>.ts` |
| `filter <Name>` | `src/filters/<name>.ts` (ExceptionFilter) |
| `guard <Name>` | `src/guards/<name>.ts` |
| `service <Name>` | `src/services/<name>.ts` (`@Injectable`) |
| `health <Name>` | `src/health/<name>.ts` (`@HealthCheck`) |
| `types` | Regenerates inferred TS types from Zod schemas — pass `--output` to redirect |

After generating any module/controller, **wire it into a module's
`controllers` array and the module into `AppModule.imports`** — the CLI
scaffolds the file but does not always touch the import graph.

## Dev loop (`nitrostack-cli dev`)

- Starts the MCP server with `tsx`/`node` hot reload.
- In parallel, runs the widget Next.js dev server on `--port` (default 3001).
- Watches both trees with chokidar; widget edits hot-reload, server edits
  restart the process automatically.
- Use NitroStudio or MCP Inspector to exercise tools.

Common debug tips:
- "Tools not registering" → confirm the controller class is listed in
  `@Module({ controllers: [...] })` and the module is in `AppModule.imports`.
- "Widget shows Loading..." → confirm the matching `@Widget('<route>')` exists
  on the tool, and `src/widgets/app/<route>/page.tsx` is present.
- "Auth errors" → run `printAuthSetupInstructions()` once or check
  `validateAuthEnv()` from `@nitrostack/core` auth helpers.

## Production build & start

```bash
npm run build      # nitrostack-cli build  → dist/
npm run start:prod # nitrostack-cli start  → runs dist
```

Dual-transport defaults: `NODE_ENV=development` uses STDIO only;
`NODE_ENV=production` opens STDIO **and** HTTP SSE.

## Upgrading

```bash
nitrostack-cli upgrade           # interactive
nitrostack-cli upgrade --dry-run # preview only
nitrostack-cli upgrade --latest  # force latest
```

Upgrades the `@nitrostack/*` versions in the project's `package.json` and
re-runs install.

## Reference

For exhaustive flag tables and the full generator template bodies, see
[reference.md](reference.md).
