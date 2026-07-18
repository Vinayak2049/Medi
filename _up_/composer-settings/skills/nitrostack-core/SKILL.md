---
name: nitrostack-core
description: >-
  Build MCP server logic with `@nitrostack/core` — decorators (`@McpApp`,
  `@Module`, `@Tool`, `@Resource`, `@Prompt`, `@Widget`), modules, DI,
  middleware/interceptors/pipes/guards/filters, MCP tasks, auth (JWT, API key,
  OAuth 2.1), config, events, cache, rate limit, and health checks. Use when
  the user writes or refactors server-side MCP code, designs a module graph,
  validates tool input with Zod, adds auth, or wires up the request lifecycle.
---

# `@nitrostack/core`

Decorator-first framework for MCP servers. Inspired by NestJS but compiles to a
single executable that speaks MCP over STDIO and HTTP SSE.

Source: `typescript/packages/core/src/`. Public surface is re-exported from
`src/core/index.ts` (server) and `src/auth/index.ts` (auth).

## Bootstrap shape (always)

```ts
import 'dotenv/config';
import { McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './app.module.js';

(async () => {
  const server = await McpApplicationFactory.create(AppModule);
  await server.start();
})();
```

```ts
import { McpApp, Module, ConfigModule } from '@nitrostack/core';

@McpApp({
  module: AppModule,
  server: { name: 'my-server', version: '1.0.0' },
  logging: { level: 'info' },
})
@Module({
  name: 'app',
  imports: [ConfigModule.forRoot(), FeatureModule],
  providers: [SystemHealthCheck],
})
export class AppModule {}
```

## Three MCP primitives

Each is a method on a controller class, registered via `@Module({ controllers })`.

### 1. Tools — actions

```ts
import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';

export class LibraryTools {
  @Tool({
    name: 'get_book',
    title: 'Get book',
    description: 'Fetch a single book by id',
    inputSchema: z.object({ id: z.string() }),
    examples: { request: { id: 'bk-1' }, response: { id: 'bk-1', title: '...' } },
  })
  @Widget('book-card')                          // optional UI route
  async getBook(input: { id: string }, ctx: ExecutionContext) {
    ctx.logger.info('get_book', input);          // never console.log
    return { id: input.id, title: 'Mythical Man-Month' };
  }
}
```

Key `ToolOptions`: `name`, `description`, `inputSchema` (Zod), optional
`outputSchema`, `title`, `annotations`, `invocation` (UI status strings),
`examples` (MANDATORY request/response examples), `metadata.rateLimit`, `taskSupport: 'forbidden' | 'optional' | 'required'`.

> [!IMPORTANT]
> **Guideline: Include Request & Response Examples**
> When creating or editing tools, you MUST include a request and response payload example directly inside the `@Tool` decorator metadata under the `examples` key. This helps client LLMs match and understand inputs and outputs correctly.

### 2. Resources — readable URIs

```ts
import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';

export class LibraryResources {
  @Resource({
    uri: 'library://catalog-overview',
    name: 'Catalog overview',
    description: 'Stats for the BookShelf catalog',
    mimeType: 'application/json',
  })
  async getCatalog(uri: string, ctx: ExecutionContext) {
    return {
      contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ totals: 42 }) }],
    };
  }
}
```

Return shape must be `{ contents: [{ uri, mimeType, text }] }`.

### 3. Prompts — message templates

```ts
import { PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';

export class LibraryPrompts {
  @Prompt({
    name: 'librarian_handoff',
    description: 'Compose a librarian handoff message',
    arguments: [{ name: 'topic', description: 'Topic', required: true }],
  })
  async librarianHandoff(args: { topic: string }, ctx: ExecutionContext) {
    return [
      { role: 'user' as const, content: `Help me find books about ${args.topic}` },
      { role: 'assistant' as const, content: 'Here are three recommendations…' },
    ];
  }
}
```

## Modules

```ts
import { Module } from '@nitrostack/core';
import { LibraryTools } from './library.tools.js';
import { LibraryResources } from './library.resources.js';
import { LibraryPrompts } from './library.prompts.js';

@Module({
  name: 'library',
  description: 'BookShelf domain module',
  controllers: [LibraryTools, LibraryResources, LibraryPrompts],
  providers: [LibraryService],
  imports: [SharedModule],
  exports: [LibraryService],
})
export class LibraryModule {}
```

- `controllers`: classes whose methods are decorated with `@Tool|@Resource|@Prompt`.
- `providers`: `@Injectable()` classes or `{ provide, useValue|useClass|useFactory }` tokens.
- `imports`: other modules whose `exports` you depend on.

## Dependency injection

```ts
import { Injectable, Inject } from '@nitrostack/core';

@Injectable()
export class LibraryService {
  constructor(@Inject('DB') private db: Db) {}
  list() { return this.db.query('select * from books'); }
}
```

Tokens can be strings, symbols, or classes. Register via a module's
`providers` array.

## Request lifecycle: guards → pipes → interceptors → handler → filters

```
incoming MCP call
   │
   ▼
@UseGuards(...)          ── allow/deny (auth, scopes, custom)
   ▼
@UsePipes(...) / @Body() ── transform/validate input
   ▼
@UseInterceptors(...)    ── wrap the handler (timing, transforms, retries)
   ▼
@Tool handler            ── your code
   ▼
@UseFilters(...)         ── catch ExceptionFilter for typed errors
```

Each decorator is a method-level or class-level annotation. Examples:

```ts
import { UseGuards, UsePipes, UseInterceptors, UseFilters } from '@nitrostack/core';

@UseGuards(AuthGuard)
@UseInterceptors(TimingInterceptor)
export class LibraryTools {
  @Tool({ name: 'create_book', description: '…', inputSchema: CreateBook })
  @UsePipes(ValidationPipe)
  @UseFilters(DomainExceptionFilter)
  async create(@Body() input: CreateBookDto) { /* … */ }
}
```

Implementations live in `src/core/{guards,pipes,interceptors,filters,middleware}/`.

## MCP Tasks (long-running tools)

Mark a tool task-aware so MCP-task clients can poll/cancel:

```ts
@Tool({
  name: 'import_catalog_snapshot',
  description: 'Long import',
  inputSchema: ImportSchema,
  taskSupport: 'required',           // or 'optional'
})
async import(input: ImportInput, ctx: ExecutionContext) {
  ctx.task?.report({ progress: 0.25, message: 'Reading…' });
  // throw new TaskCancelledError() to honor cancellations
  return { imported: 100 };
}
```

Errors and helpers: `TaskManager`, `TaskContext`, `TaskNotFoundError`,
`TaskAlreadyTerminalError`, `InvalidTaskTransitionError`, `TaskCancelledError`,
`TaskAugmentationRequiredError`, `TaskExpiredError`, `isTerminalStatus`,
`TERMINAL_STATUSES`.

## Auth — three tiers

1. **API key** (simplest):

   ```ts
   import { ApiKeyModule } from '@nitrostack/core';

   imports: [ApiKeyModule.forRoot({ keys: [process.env.API_KEY!] })]
   ```

2. **JWT** (recommended default):

   ```ts
   import { JWTModule } from '@nitrostack/core';

   imports: [JWTModule.forRoot({ secret: process.env.JWT_SECRET! })]
   ```

   Helpers: `setupJWTAuth`, `generateJWT`, `verifyJWT`, `decodeJWT`,
   `generateTestCredentials`.

3. **OAuth 2.1** (full spec):

   ```ts
   import { OAuthModule } from '@nitrostack/core';

   imports: [OAuthModule.forRoot({ issuer: 'https://auth.example.com', audience: 'mcp' })]
   ```

   Spec compliance: RFC 9728, 8414, 7591, 8707, 7636, 7662, 6750.

Guard helpers: `RequireScopes`, `requireScopes`, `optionalAuth`,
`hasScope`, `hasAllScopes`, `hasAnyScope`, `isAuthenticated`,
`createMCPScopeGuards`, `getStandardMCPScopes`.

Secrets: never inline. Wrap with `SecretValue.fromValue(...)` or read via
`ConfigService`.

## Cross-cutting decorators

```ts
@Cache({ ttl: 60_000 })            // method-level memoization
@RateLimit({ maxCalls: 10, windowMs: 60_000 })
@HealthCheck({ name: 'db', interval: 30 })   // class-level
@OnEvent('book.created')           // event subscriber
```

## Config

```ts
import { ConfigModule, ConfigService, Injectable } from '@nitrostack/core';

imports: [ConfigModule.forRoot()]

@Injectable({ deps: [ConfigService] })   // ConfigService is the most-forgotten dep — it MUST be listed
export class S { constructor(private cfg: ConfigService) {} read() { return this.cfg.get('FOO'); } }
```

`deps` resolution is positional: any constructor-injected provider (including
`ConfigService`) that is missing from `deps` will be `undefined` at runtime even
though typecheck passes.

## Always-true rules

- One controller class per file (`*.tools.ts`, `*.resources.ts`, `*.prompts.ts`,
  `*.tasks.ts`). Reflects the file naming used by `nitrostack-cli generate`.
- Every tool input must be a Zod schema. Prefer `.describe()` per field.
- Use `context.logger`, never `console.*`.
- Return JSON-serialisable values from handlers; resources must return the
  `contents` array shape.
- Do not import widget React code into server modules.

## Reference

For the exhaustive export list and less-common knobs, see
[reference.md](reference.md).
