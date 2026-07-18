# nitrostack-mongoose — reference

## Checklist (new MongoDB project)

- [ ] Confirm `MONGODB_URI` in `.env` and `nitro-integrations.json` database entry
- [ ] `mongoose` in `package.json` dependencies
- [ ] `ConfigModule.forRoot({ isGlobal: true })` loads `.env`
- [ ] `DatabaseModule` + `DatabaseService` with lifecycle hooks
- [ ] Schemas for each persisted entity
- [ ] Feature modules import `DatabaseModule`
- [ ] Tools use services, not raw `mongoose.connect` in handlers
- [ ] All framework imports from `@nitrostack/core` (never `@nestjs/*`)
- [ ] In-project imports end in `.js`
- [ ] `@Injectable({ deps: [...] })` lists every injected provider (incl. `ConfigService`)
- [ ] No `console.*` in server code (use `ctx.logger`)
- [ ] Seed data includes `imageUrl` values
- [ ] `agent-typecheck` clean

## Example schema

```typescript
import { Schema, model, Document } from 'mongoose';

export interface BookDoc extends Document {
  title: string;
  author: string;
  imageUrl: string; // include images so widgets render richly
}

const bookSchema = new Schema<BookDoc>(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

bookSchema.index({ title: 1 });

export const BookModel = model<BookDoc>('Book', bookSchema);
```

## nitro-integrations.json shape

```json
{
  "version": 1,
  "integrations": {
    "database": [
      {
        "provider": "mongodb",
        "envKey": "MONGODB_URI",
        "database": "my_app",
        "addedAt": 1710000000000
      }
    ],
    "auth": [],
    "storage": [],
    "functions": []
  }
}
```

## PostgreSQL / MySQL (brief)

| Provider   | Env key          | npm package |
|-----------|------------------|-------------|
| postgres  | DATABASE_URL     | pg          |
| mysql     | DATABASE_URL     | mysql2      |

Use a pooled client in `DatabaseService`, register in `AppModule`, and inject into tool services.
