# Nitro Widget Engineering Skills File

## Purpose

This document captures the engineering rules, patterns, safeguards, and architectural principles required to build stable Nitro widgets that do not:

* timeout
* blank screen
* hang during hydration
* fail during streaming
* crash on partial tool output

It is based on debugging a failing analytics widget versus a working pizza widget.

---

# Core Principle

## Nitro widgets are asynchronous and partially hydrated

The most important concept:

```txt
SDK readiness does NOT guarantee tool output readiness.
```

At runtime:

* `isReady === true`
* but tool output may still be:

  * undefined
  * partial
  * malformed
  * streaming
  * delayed

Widgets must therefore be written defensively.

---

# Golden Rules

# RULE 1 — Never trust getToolOutput()

## BAD

```tsx
const data = getToolOutput<MyData>();
const { metrics } = data;
```

## GOOD

```tsx
const data = getToolOutput<MyData>();

if (!data) {
  return <Loading />;
}

if (!data.metrics) {
  return <Error />;
}
```

## Why

Tool output is runtime data.

TypeScript interfaces DO NOT validate runtime payloads.

---

# RULE 2 — Validate every nested object

## BAD

```tsx
Object.keys(metrics.questionsByCategory)
```

## GOOD

```tsx
const categories = metrics.questionsByCategory ?? {};
```

## Why

This crashes instantly:

```txt
Cannot convert undefined or null to object
```

---

# RULE 3 — Default every array

## BAD

```tsx
metrics.trendingQueries.map(...)
```

## GOOD

```tsx
(metrics.trendingQueries ?? []).map(...)
```

## Why

Undefined arrays are the #1 source of widget render crashes.

---

# RULE 4 — Default every object

## GOOD PATTERN

```tsx
const metrics = {
  totalQuestions: data.metrics?.totalQuestions ?? 0,
  answeredQuestions: data.metrics?.answeredQuestions ?? 0,
  unansweredQuestions: data.metrics?.unansweredQuestions ?? 0,
  answerRate: data.metrics?.answerRate ?? 0,
  averageConfidence: data.metrics?.averageConfidence ?? 0,
  topUnansweredTopics: data.metrics?.topUnansweredTopics ?? [],
  trendingQueries: data.metrics?.trendingQueries ?? [],
  questionsByCategory: data.metrics?.questionsByCategory ?? {},
};
```

---

# RULE 5 — Separate SDK readiness from data readiness

## BAD

```tsx
if (!isReady || !data)
```

## GOOD

```tsx
if (!isReady)
if (!data)
if (!data.metrics)
if (!Array.isArray(data.metrics.trendingQueries))
```

## Why

The SDK can hydrate before the payload finishes streaming.

---

# RULE 6 — Never assume arrays exist

## BAD

```tsx
metrics.topUnansweredTopics.length
```

## GOOD

```tsx
(metrics.topUnansweredTopics ?? []).length
```

---

# RULE 7 — Never allow render exceptions

Widgets should NEVER crash during render.

Every widget should support:

* loading state
* partial state
* malformed state
* **empty / zero-result state** (successful tool call but no rows — e.g. no flights found)
* fallback state

## GOOD (empty results)

```tsx
const flights = data?.flights ?? [];
if (flights.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Plane className="w-10 h-10 text-muted-foreground/50 mb-3" />
      <p className="text-sm font-semibold">No flights found</p>
      <p className="text-xs text-muted-foreground mt-1">Try different dates or airports.</p>
    </div>
  );
}
```

Empty ≠ error: use neutral styling for zero results; reserve red/destructive for malformed payloads or tool failures.

## GOOD

```tsx
if (!data.metrics) {
  return (
    <div>
      Invalid payload
    </div>
  );
}
```

---

# RULE 8 — Log aggressively during development

> SCOPE: This rule applies ONLY to widget code under `src/widgets/**`, which runs in the browser. NEVER put `console.*` in MCP server code (`src/index.ts`, `*.tools.ts`, `*.service.ts`, `*.module.ts`, etc.) — the server speaks over STDIO and any console output corrupts the protocol stream. Use `ctx.logger` there instead.

## REQUIRED (widgets only)

```tsx
console.log('Widget render', {
  isReady,
  data,
});

console.error('Invalid payload', data);
```

## Why

Nitro hydration issues are timing-sensitive.

Without logs:

* widgets silently fail
* retries occur forever
* debugging becomes impossible

---

# RULE 9 — Metadata must stay static

## BAD

```tsx
export const metadata = defineWidgetMetadata({
  examples: [
    {
      timestamp: new Date().toISOString(),
    },
  ],
});
```

## GOOD

```tsx
export const metadata = defineWidgetMetadata({
  uri: '/analytics-dashboard',
  name: 'Analytics Dashboard',
  description: 'Analytics widget',
});
```

## Avoid in metadata

* new Date()
* Date.now()
* random values
* dynamic computations
* unstable imports

---

# RULE 10 — Protect all calculations

## BAD

```tsx
(count / metrics.totalQuestions) * 100
```

## GOOD

```tsx
metrics.totalQuestions > 0
  ? (count / metrics.totalQuestions) * 100
  : 0
```

## Why

Prevents:

* Infinity
* NaN
* invalid style values

---

# RULE 11 — Use staged rendering

## Recommended Rendering Flow

```tsx
if (!isReady) {
  return <Initializing />;
}

if (!data) {
  return <Loading />;
}

if (!data.metrics) {
  return <MalformedPayload />;
}

return <Widget />;
```

---

# RULE 12 — Treat tool output as untrusted API input

Mentally model:

```txt
getToolOutput() === external API response
```

Never assume correctness.

Always validate.

---

# RULE 13 — Prefer resilience over elegance

The best Nitro widgets are:

* defensive
* verbose
* explicit
* stable

NOT:

* minimal
* assumption-heavy
* overly concise

---

# RULE 14 — Add malformed payload debugging UI

> SCOPE: widget code only (`src/widgets/**`). Do NOT add debug logging to server code.

## GOOD

```tsx
return (
  <pre>
    {JSON.stringify(data, null, 2)}
  </pre>
);
```

## Why

During widget development:

* payload visibility matters more than pretty UI
* silent failures waste hours

---

# RULE 15 — Never destructure unvalidated objects

## BAD

```tsx
const { metrics } = data;
```

## GOOD

```tsx
const metrics = data?.metrics;

if (!metrics) {
  return <Error />;
}
```

---

# RULE 16 — Arrays should always be validated

## GOOD

```tsx
if (!Array.isArray(data.shops)) {
  return <Error />;
}
```

---

# RULE 17 — Production-safe widget architecture

## Recommended Widget Structure

```tsx
export default function Widget() {
  const { isReady, getToolOutput } = useWidgetSDK();

  const data = getToolOutput<MyData>();

  console.log('Widget render', {
    isReady,
    data,
  });

  // Stage 1
  if (!isReady) {
    return <Initializing />;
  }

  // Stage 2
  if (!data) {
    return <Loading />;
  }

  // Stage 3
  if (!data.payload) {
    return <MalformedPayload />;
  }

  // Stage 4
  const payload = {
    items: data.payload.items ?? [],
    count: data.payload.count ?? 0,
  };

  // Stage 5
  return <WidgetUI payload={payload} />;
}
```

---

# Common Failure Patterns

# Failure Pattern 1 — Immediate destructuring

## BAD

```tsx
const { metrics } = data;
```

---

# Failure Pattern 2 — Unsafe Object.keys

## BAD

```tsx
Object.keys(undefined)
```

---

# Failure Pattern 3 — Unsafe .map()

## BAD

```tsx
undefined.map(...)
```

---

# Failure Pattern 4 — Assuming SDK ready means payload ready

## BAD ASSUMPTION

```txt
isReady === valid payload
```

This is false.

---

# Failure Pattern 5 — Dynamic metadata

## BAD

```tsx
new Date()
```

inside metadata.

---

# Recommended Development Checklist

Before shipping a widget:

* [ ] Validate all top-level objects
* [ ] Validate all arrays
* [ ] Add fallback defaults
* [ ] Add loading state
* [ ] Add malformed payload state
* [ ] Add console logs
* [ ] Protect calculations
* [ ] Remove unsafe destructuring
* [ ] Remove unsafe Object.keys
* [ ] Ensure metadata is static
* [ ] Test partial payloads
* [ ] Test undefined arrays
* [ ] Test empty objects
* [ ] Test delayed hydration

---

# The Most Important Philosophy

The pizza widget worked because it followed this philosophy:

```txt
Validate first.
Render second.
Assume nothing.
```

The analytics widget failed because it assumed:

```txt
SDK ready means payload valid.
```

That assumption is incorrect in Nitro widgets.
