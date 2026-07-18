# Compose Stage-by-Stage Settings, Guardrails, Guidelines & Skills

This directory arranges all agent settings, skills, guidelines, and guardrails based on the development stage they apply to, providing a single location for complete visibility.

---

## 1. Stage 1: Planning & Research

### Skills
- [nitrostack](file:///Users/abhishekpandit/projects/nitrostudio/composer-settings/skills/nitrostack/SKILL.md) — Master routing skill covering application structure and workflow guidelines.
- [nitrostack-cli](file:///Users/abhishekpandit/projects/nitrostudio/composer-settings/skills/nitrostack-cli/SKILL.md) — Scaffolding commands (`init`, `generate`) and development loop setup.

### Guidelines / Rules
- **Task Planning Checklist Requirement**: Before starting any multi-step build, the planner agent MUST call `agent-write-todos` with a concrete checklist.
- **Git Checkpoint Policy**: Checkpoints should be created before starting a new step to allow safe reverts.

---

## 2. Stage 2: Database & Backend Services

### Skills
- [nitrostack-core](file:///Users/abhishekpandit/projects/nitrostudio/composer-settings/skills/nitrostack-core/SKILL.md) — Dependency injection, decorators, and controllers.
- [nitrostack-mongoose](file:///Users/abhishekpandit/projects/nitrostudio/composer-settings/skills/nitrostack-mongoose/SKILL.md) — MongoDB connections, Mongoose schemas, and seed data.

### Guidelines / Rules
- **Service Layer Separation**: Business logic and database queries must be written in `<module>.service.ts` rather than directly in `<module>.tools.ts`. Sibling tools must import and invoke the service functions.
- **No Console Logging**: `console.*` is strictly forbidden in server-side files because it corrupts the STDIO transport protocol. Always use the `ExecutionContext` logger (`ctx.logger`).
- **ESM Extensions**: All local file relative imports MUST include the `.js` extension (e.g. `import { Service } from './service.js'`).
- **DI Constructor Registration**: Every constructor-injected class (including `ConfigService`) MUST be registered in the `@Injectable({ deps: [...] })` array in identical order.
- **Image URLs in Seed Data**: All seed/fixture records must populate `imageUrl` with real, stable HTTPS links to enable high-quality widget renders.

---

## 3. Stage 3: Tool & API Implementation

### Guidelines / Rules
- **Tool Decorator Examples (MANDATORY)**: When creating/modifying tools, request and response examples must be declared directly in the `@Tool` decorator under the `examples` key.
  ```typescript
  @Tool({
    name: 'get_book',
    description: 'Fetch book details',
    inputSchema: z.object({ id: z.string() }),
    examples: {
      request: { id: 'bk-1' },
      response: { id: 'bk-1', title: 'The Pragmatic Programmer', author: 'Hunt & Thomas' }
    }
  })
  ```
- **Database Identifiers Alignment**: If the database schema expects Mongo `ObjectId` but the conversational test cases/prompts refer to names/emails, the tool must dynamically resolve them.
- **Date/Time Arguments Alignment**: Ensure mock test data formats and relative descriptions (e.g. "this weekend") align perfectly with the tool's inputSchema formats (e.g. ISO string).

---

## 4. Stage 4: Frontend & Widget UI

### Skills
- [nitrostack-widgets](file:///Users/abhishekpandit/projects/nitrostudio/composer-settings/skills/nitrostack-widgets/SKILL.md) — Widget SDK hook API reference.
- [design](file:///Users/abhishekpandit/projects/nitrostudio/composer-settings/skills/design/SKILL.md) — Polish, aesthetics, tailwind primitives, and spacing rules.

### Guidelines / Rules
- **Widget Manifest Synchronization (MANDATORY)**: Whenever a widget UI folder under `src/widgets/app/` is created or modified, `src/widgets/widget-manifest.json` MUST be updated/synchronized with the exact same URI, details, examples, and tags. Missing manifest records cause previews to timeout.
- **Boilerplate Requirements**: Widget page files must start with `'use client'` and export `export const dynamic = 'force-dynamic'`.
- **Top-Level Standalone Hooks**: Standalone hooks (`useTheme`, `useMaxHeight`, `useDisplayMode`, `useWidgetState`) must be imported from `@nitrostack/widgets` and called at the top of the component. Never destructure them from `useWidgetSDK()`.
- **Defensive Rendering**:
  - Never trust `getToolOutput` blindly; null-check before destructuring.
  - Default all arrays before calling `.map` or `.length` (e.g. `(items ?? []).map(...)`).
  - Staged rendering: `if (!isReady) return <Loading /> ...`
  - Zero-result / empty outcomes must render beautiful empty states instead of crashing or showing plain text.

---

## 5. Stage 5: Verification & Verification Loops

### Guidelines / Rules
- **Incremental Smoke Tests**: After a tool and widget are built, run `agent-test-progress` immediately to check features turn-by-turn.
- **Conversation Tests**: When functionally complete and typechecking passes cleanly, run `agent-trigger-conversation-test` to execute the full multi-turn test suite.
