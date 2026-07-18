# `@nitrostack/cli` — reference

Source of truth: `typescript/packages/cli/src/`.

## Binary names

`package.json`:

```json
"bin": {
  "nitrostack-cli": "dist/index.js",
  "@nitrostack/cli": "dist/index.js"
}
```

The Commander program name is `nitrostack`. Templates ship scripts using
`nitrostack-cli` — keep that string when editing generated `package.json`.

## All commands (verbatim from `src/index.ts`)

| Command | Args | Options |
|---|---|---|
| `init` | `[project-name]` | `--template <typescript-starter|typescript-pizzaz|typescript-oauth>`, `--description <text>`, `--author <name>`, `--skip-install` |
| `dev` | — | `--port <port>` (default `3001` for widget dev server) |
| `build` | — | `--output <path>` (default `dist`) |
| `start` | — | `--port <port>` (default `3000`) |
| `generate` (`g`) | `<type> [name]` | `--module <name>`, `--output <path>`, `--force`, `--skip-related` |
| `upgrade` | — | `--dry-run`, `--latest` |
| `install` (`i`) | — | `--skip-widgets`, `--production` |

## Valid `generate` types

From `src/commands/generate.ts`:

```
middleware, interceptor, pipe, filter, service, guard, health,
module, tools, resources, prompts, types
```

`module|tools|resources|prompts` write to `src/modules/<module>/<module>.<type>.ts`.
Everything else uses a per-type dir under `src/` (see table in `SKILL.md`).

## Generator skeletons

### `middleware`

```ts
import { Middleware, MiddlewareInterface, ExecutionContext } from '@nitrostack/core';

@Middleware()
export class <Name> implements MiddlewareInterface {
  async use(context: ExecutionContext, next: () => Promise<any>) {
    context.logger.info(`[${context.toolName}] Started`);
    const result = await next();
    context.logger.info(`[${context.toolName}] Completed`);
    return result;
  }
}
```

### `interceptor`

```ts
import { Interceptor, InterceptorInterface, ExecutionContext } from '@nitrostack/core';

@Interceptor()
export class <Name> implements InterceptorInterface {
  async intercept(context: ExecutionContext, next: () => Promise<any>) {
    const result = await next();
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }
}
```

### `pipe`

```ts
import { Pipe, PipeInterface, ArgumentMetadata } from '@nitrostack/core';

@Pipe()
export class <Name> implements PipeInterface {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (!value) throw new Error('Value is required');
    return value;
  }
}
```

### `prompts`

```ts
import { PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';

export class <Name>Prompts {
  @Prompt({ name: '<name>-help', description: 'TODO' })
  async helpPrompt(args: Record<string, unknown>, context: ExecutionContext) {
    return [{ role: 'user' as const, content: { type: 'text' as const, text: 'TODO' } }];
  }
}
```

(Other generators follow the same shape — open `src/commands/generate.ts`
for full bodies.)

## Templates folder layout

```
typescript/packages/cli/templates/
├── typescript-starter/    # Single calculator module + one widget
├── typescript-pizzaz/     # Multi-widget pizzaz demo (recommended deep example)
└── typescript-oauth/      # OAuth 2.1 server with protected routes
```

Each template ships its own `src/widgets/` Next.js project with its own
`package.json` — `nitrostack-cli install` walks both.

## Environment defaults

- `NODE_ENV=development` → STDIO transport only (good for Studio).
- `NODE_ENV=production` → STDIO + HTTP SSE (good for hosted deployments).
- Widget dev server defaults to port `3001` (override with `--port`).
- Production HTTP server defaults to port `3000` (override with `--port`).
