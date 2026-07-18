---
name: nitrostack-mongoose
description: >-
  Connect NitroStack MCP servers to MongoDB with Mongoose: ConfigModule, DatabaseModule,
  schemas, models, and DB-backed tools. Use when the user mentions MongoDB, Mongoose,
  MONGODB_URI, database modules, schemas, or nitro-integrations.json database entries.
---

# MongoDB + Mongoose in NitroStack

Use this skill when the project has (or should have) a MongoDB integration — typically
`MONGODB_URI` in `.env` and an entry in `nitro-integrations.json`.

## Environment

- Read `MONGODB_URI` from `.env` via `@nitrostack/core`'s `ConfigModule` / `ConfigService` (NOT `@nestjs/config`) — never hardcode secrets.
- Connection strings are written during onboarding or from the Compose Integrations panel.
- **`MONGODB_URI` already includes the target database name in its path** (e.g. `mongodb+srv://user:pass@host/myDb?appName=x`). Pass the URI straight to `mongoose.connect(uri)` and do NOT override the database — never call `.connect(uri, { dbName: 'test' })`, never hardcode `test`, never append a different db. Only set `dbName` if the URI genuinely has no path segment.

## Recommended layout

```
src/
├── database/
│   ├── database.module.ts
│   ├── database.service.ts
│   └── schemas/
│       └── *.schema.ts
├── <feature>/
│   ├── *.tools.ts      # inject DatabaseService or models
│   └── *.module.ts
```

Register `DatabaseModule` in `AppModule` **before** feature modules that depend on it.

## DatabaseModule pattern

1. `DatabaseService` connects in `onModuleInit` and disconnects in `onModuleDestroy`.
2. Inject `ConfigService` to read `MONGODB_URI`.
3. Export `DatabaseService` (and optionally `getModelToken` helpers) from `DatabaseModule`.

```typescript
// All framework imports come from @nitrostack/core — NEVER @nestjs/*.
import { Injectable, ConfigService, OnModuleInit, OnModuleDestroy } from '@nitrostack/core';
import mongoose from 'mongoose';

// ConfigService is injected → it MUST appear in deps.
@Injectable({ deps: [ConfigService] })
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const uri = this.config.get<string>('MONGODB_URI');
    if (!uri) throw new Error('MONGODB_URI is not set');
    // The URI already contains the target database in its path — connect as-is.
    await mongoose.connect(uri);
  }

  async onModuleDestroy(): Promise<void> {
    await mongoose.disconnect();
  }
}
```

## Schemas and models

- Define schemas under `src/database/schemas/`.
- Export typed models from the schema file or a small `models.ts` barrel.
- Add indexes in the schema definition when tools query by those fields.
- **Imports of in-project files MUST end in `.js`** (NodeNext ESM): `import { BookModel } from './schemas/book.schema.js';`.
- **Include an `imageUrl` field on any entity that will render in a widget** so cards/lists look rich rather than text-only.

```typescript
import { Schema, model, Document } from 'mongoose';

export interface BookDoc extends Document {
  title: string;
  author: string;
  imageUrl: string; // cover image — surfaced in widget cards
}

const bookSchema = new Schema<BookDoc>(
  {
    title: { type: String, required: true, index: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export const BookModel = model<BookDoc>('Book', bookSchema);
```

## Seed data

- When seeding/fixtures, **always populate `imageUrl` with a real, stable image URL** (e.g. an Unsplash or CDN link), not an empty string or `null`. Image-rich seed data makes the generated widgets look polished out of the box.

```typescript
await BookModel.insertMany([
  {
    title: 'The Pragmatic Programmer',
    author: 'Hunt & Thomas',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
  },
]);
```

## Tools

- Keep `@Tool` methods thin: validate input, call a service, return JSON-serializable data.
- Do not open ad-hoc connections per tool call — reuse `DatabaseService` / injected models.
- After adding schemas or tools, run `agent-typecheck`.

## Other databases (PostgreSQL, MySQL, …)

For non-Mongo providers listed in `nitro-integrations.json`:

1. Install the npm driver (`pg`, `mysql2`, etc.) — already done if onboarding selected them.
2. Add env vars from `.env` via `ConfigModule`.
3. Create a `DatabaseModule` + service with the driver’s connection pool pattern.
4. Wire tools through that service; follow the same module/DI rules as Mongoose.

See [reference.md](./reference.md) for a fuller Mongoose + NitroStack checklist.
