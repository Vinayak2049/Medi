---
name: nitrostack
description: >-
  Build production MCP (Model Context Protocol) servers and widget UIs with the
  NitroStack TypeScript stack (`@nitrostack/cli`, `@nitrostack/core`,
  `@nitrostack/widgets`). Use whenever the user asks to scaffold, extend,
  refactor, debug, or deploy an MCP server / tool / resource / prompt / widget
  using NitroStack, or mentions `nitrostack-cli`, `McpApp`, `@Tool`,
  `@Resource`, `@Prompt`, `@Widget`, `useWidgetSDK`, or `defineWidgetMetadata`.
---

# NitroStack MCP Master Skill

NitroStack is a NestJS-inspired TypeScript framework for shipping MCP servers
with first-class widget UIs. Three packages cooperate:

| Package | Purpose | Detail skill |
|---|---|---|
| `@nitrostack/cli` | Scaffold, dev-loop, build, deploy | [nitrostack-cli/SKILL.md](../nitrostack-cli/SKILL.md) |
| `@nitrostack/core` | Server, decorators, DI, auth, middleware | [nitrostack-core/SKILL.md](../nitrostack-core/SKILL.md) |
| `@nitrostack/widgets` | React SDK for ChatGPT/MCP-Apps widget UIs | [nitrostack-widgets/SKILL.md](../nitrostack-widgets/SKILL.md) |
| MongoDB / Mongoose | Database module, schemas, DB-backed tools | [nitrostack-mongoose/SKILL.md](../nitrostack-mongoose/SKILL.md) |

The source of truth lives in `typescript/packages/{cli,core,widgets}/`.

## When this skill applies

Read this file first, then load **only** the per-package skill(s) you need:

- Scaffolding, `npm run dev`, generators, deploying → `nitrostack-cli`
- Tools, Resources, Prompts, Modules, Guards, Pipes, Tasks, Auth → `nitrostack-core`
- React widget pages, `useWidgetSDK`, examples, manifests → `nitrostack-widgets`
- MongoDB, Mongoose, `MONGODB_URI`, `nitro-integrations.json` → `nitrostack-mongoose`

Most non-trivial tasks span at least two of these — load both.

## The mental model (do not skip)

An MCP application is a tree:

```
McpApp ──► AppModule ──► Feature modules
                            ├── *.tools.ts   (@Tool methods + optional @Widget)
                            ├── *.resources.ts (@Resource methods)
                            ├── *.prompts.ts (@Prompt methods)
                            └── *.tasks.ts   (@Tool with taskSupport)
src/widgets/                ──► Next.js project rendering @Widget routes
src/widgets/widget-manifest.json ──► Studio preview examples
```

Rules that always hold:
1. A class becomes a controller by being listed in a `@Module({ controllers: [...] })`.
2. Modules are wired into the app via `AppModule`'s `imports`.
3. Bootstrap is always `McpApplicationFactory.create(AppModule).then(s => s.start())`.
4. Tools that should render UI use both `@Tool({...})` **and** `@Widget('<route>')`.
   The `<route>` matches a folder under `src/widgets/app/<route>/page.tsx`.
5. Inputs are validated with Zod schemas — never accept untyped input.
6. Inside handlers, log via `context.logger`, never `console.*`. STDIO transport
   uses stdout for JSON-RPC; `console.log` corrupts the protocol.

## Standard workflow for "build an MCP app"

```
Task progress:
- [ ] Step 1: Confirm or scaffold a project with the CLI
- [ ] Step 2: Design the module(s) — tools, resources, prompts
- [ ] Step 3: Implement controllers with Zod-validated inputs
- [ ] Step 4: Register controllers in a feature module and import into AppModule
- [ ] Step 5: (Optional) Attach @Widget routes and build the React UI
- [ ] Step 6: Run `npm run dev`, test in Studio / MCP Inspector
- [ ] Step 7: Add health checks, auth, and middleware as needed
- [ ] Step 8: `npm run build` and deploy
```

For each step, consult the per-package skill instead of guessing API shapes.

## Minimum-viable example (memorise this shape)

`src/index.ts`:

```ts
import 'dotenv/config';
import { McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const server = await McpApplicationFactory.create(AppModule);
  await server.start();
}
bootstrap().catch((err) => { console.error(err); process.exit(1); });
```

`src/app.module.ts`:

```ts
import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { LibraryModule } from './modules/library/library.module.js';

@McpApp({
  module: AppModule,
  server: { name: 'bookshelf', version: '1.0.0' },
  logging: { level: 'info' },
})
@Module({
  name: 'app',
  imports: [ConfigModule.forRoot(), LibraryModule],
})
export class AppModule {}
```

`src/modules/library/library.tools.ts`:

```ts
import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';

export class LibraryTools {
  @Tool({
    name: 'get_book',
    description: 'Fetch a single book by id',
    inputSchema: z.object({ id: z.string() }),
  })
  @Widget('book-card')
  async getBook(input: { id: string }, ctx: ExecutionContext) {
    ctx.logger.info('get_book', input);
    return { id: input.id, title: 'The Mythical Man-Month', author: 'Brooks' };
  }
}
```

`src/modules/library/library.module.ts`:

```ts
import { Module } from '@nitrostack/core';
import { LibraryTools } from './library.tools.js';

@Module({ name: 'library', controllers: [LibraryTools] })
export class LibraryModule {}
```

That is the whole pattern. Everything else in `nitrostack-core` is composition
on top of this skeleton (guards, pipes, interceptors, tasks, events, cache,
rate limit, auth modules). See `nitrostack-core/SKILL.md`.

## Anti-patterns to refuse

- Calling `console.log` inside tools/resources/prompts (breaks STDIO transport).
- Skipping the Zod `inputSchema` or using `z.any()` for tool inputs.
- Returning ad-hoc shapes from `@Resource` methods. Always return
  `{ contents: [{ uri, mimeType, text }] }`.
- Putting the React widget code anywhere outside `src/widgets/`.
- Importing widget code into the server bundle (separate `tsconfig` / install).
- Adding tools to a module without listing the class under `controllers: [...]`.
- Hardcoding secrets — use `ConfigModule`, env vars, or `SecretValue`.

## What to do when stuck

1. Re-read the matching per-package SKILL.md fully.
2. Look at the canonical templates in
   `typescript/packages/cli/templates/typescript-starter/` (and `-pizzaz`,
   `-oauth`) for working reference code — these are the truth.
3. Inspect the public exports in `typescript/packages/<pkg>/src/index.ts` (or
   `src/core/index.ts` for core) before inventing imports.

## Documentation links (humans)

- Docs site: <https://docs.nitrostack.ai>
- Studio: <https://nitrostack.ai/studio>
- GitHub: <https://github.com/nitrocloudofficial/nitrostack>
