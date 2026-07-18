# `@nitrostack/core` — reference

Source of truth: `typescript/packages/core/src/core/index.ts` and
`typescript/packages/core/src/auth/index.ts`.

## Public exports — server framework

```ts
// Bootstrap
McpApp, McpApplicationFactory, getMcpAppMetadata
type McpAppOptions

// Server / transports
createServer, NitroStackServer
HttpServerTransport
type HttpServerTransportOptions, McpServerConfig

// Decorators (V3) — preferred names
ToolDecorator       // alias for `Tool` from decorators.ts
ResourceDecorator   // alias for `Resource`
PromptDecorator     // alias for `Prompt`
Widget, InitialTool
extractTools, extractResources, extractPrompts
getWidgetMetadata, getGuardsMetadata
type ToolOptions, ResourceOptions, PromptOptions
type ToolInvocationMessages, WidgetCspOptions, WidgetRouteMetadata

// Legacy factory-style API (still exported)
Tool   // legacy method-decorator
createResource, Resource, ResourceTemplate, createResourceTemplate
createPrompt, Prompt
createComponent, Component

// Module system
Module, createModule, isModule, getModuleMetadata
type ModuleMetadata, ModuleImport, DynamicModule, Provider

// DI
DIContainer
Injectable, Inject, isInjectable, getInjectTokens
type InjectableOptions

// Lifecycle decorators
UseGuards, getGuardsMetadataFromDecorator
type Guard, GuardConstructor
UseMiddleware, Middleware, getMiddlewareMetadata, isMiddleware
type MiddlewareInterface, MiddlewareConstructor
UseInterceptors, Interceptor, getInterceptorMetadata, isInterceptor
type InterceptorInterface, InterceptorConstructor
UsePipes, Pipe, Body, Validated, getPipeMetadata, getParamPipesMetadata, isPipe
type PipeInterface, PipeConstructor, ArgumentMetadata
UseFilters, ExceptionFilter, getExceptionFilterMetadata, isExceptionFilter
type ExceptionFilterInterface, ExceptionFilterConstructor

// Cross-cutting decorators
Cache, clearCache, getCacheMetadata
type CacheOptions, CacheStorage
RateLimit, resetRateLimit, getRateLimitMetadata
type RateLimitOptions, RateLimitStorage
HealthCheck, registerHealthCheck, getAllHealthChecks, getHealthCheck,
getOverallHealth, isHealthCheck, getHealthCheckMetadata
type HealthCheckOptions, HealthCheckResult, HealthCheckInterface

// Events
EventEmitter
OnEvent, getEventHandlers, registerEventHandlers, emitEvent

// Config
ConfigModule, ConfigService
type ConfigModuleOptions

// MCP Tasks
TaskManager, TaskContext
TaskNotFoundError, TaskAlreadyTerminalError, InvalidTaskTransitionError
TaskCancelledError, TaskAugmentationRequiredError, TaskExpiredError
isTerminalStatus, TERMINAL_STATUSES
type TaskStatus, TaskData, TaskParams, CreateTaskResult, TaskSupportLevel

// Built-in auth modules
JWTModule;      type JWTModuleConfig
ApiKeyModule;   type ApiKeyModuleConfig
OAuthModule;    type OAuthModuleConfig, OAuthDiscoveryInfo

// Builders (low-level — usually not needed)
buildTool, buildTools, buildResource, buildResources, buildPrompt,
buildPrompts, buildController

// Shared types
type ToolDefinition, ToolAnnotations, ToolResultContent
type ResourceDefinition, ResourceTemplateDefinition, ResourceAnnotations
type PromptDefinition, ExecutionContext, Logger, AuthContext
type EmbeddedResource, ResourceLink
type JsonValue, JsonValueOrUndefined, JsonObject, JsonArray, JsonPrimitive
type Constructor, ClassConstructor

// Re-export
import { z } from 'zod';        // exported as `z` for convenience

// Constants
WIDGET_MIME_TYPE              = 'text/html'
MCP_APPS_MIME_TYPE            = 'text/html'
OPENAI_SKYBRIDGE_MIME_TYPE    = 'text/html+skybridge'

// Logger
createLogger, defaultLogger
```

## Public exports — auth (`@nitrostack/core` re-exports these too)

```ts
// Secret handling
SecretValue, isSecretValue, unwrapSecret
type SecretString, FromValueOptions

// Simple JWT
createSimpleJWTAuth, generateJWT, verifyJWT, decodeJWT
type SimpleJWTConfig, JWTPayload, StandardJWTClaims, CustomJWTClaims, GenerateJWTOptions

// API key
createAPIKeyAuth, generateAPIKey, hashAPIKey, isValidAPIKeyFormat
generateAPIKeyWithMetadata, validateAPIKeyWithMetadata
type APIKeyConfig, APIKeyWithMetadata

// Quick setup helpers
setupJWTAuth, setupAPIKeyAuth, setupOAuthAuth
generateTestCredentials, printAuthSetupInstructions, validateAuthEnv

// OAuth 2.1 building blocks
* (types.js)
* (pkce.js)
* (server-metadata.js)
* (token-validation.js)
createAuthMiddleware, requireScopes, optionalAuth, RequireScopes
isAuthenticated, hasScope, hasAnyScope, hasAllScopes
OAuth2Client
TokenStore, MemoryTokenStore, FileTokenStore
createDefaultTokenStore, isTokenExpired, calculateExpiration, tokenResponseToStored
configureServerAuth, createScopeGuards, createMCPScopeGuards
getStandardMCPScopes, validateAuthConfig
```

## `@Widget` decorator — full options form

```ts
@Widget('book-card')                              // string route
@Widget({
  route: 'book-card',                             // required
  prefersBorder: true,                            // openai/widgetPrefersBorder
  domain: 'https://myapp.example.com',            // openai/widgetDomain
  csp: {
    connectDomains: ['https://api.example.com'],
    resourceDomains: ['https://images.example.com'],
    frameDomains:    ['https://*.example.com'],
  },
})
```

`route` must match a folder `src/widgets/app/<route>/page.tsx` whose Next.js
build is bundled into the server-served `widget-manifest.json`.

## `@Tool` options reference

```ts
interface ToolOptions {
  name: string;
  title?: string;
  description: string;
  inputSchema: z.ZodSchema;
  outputSchema?: z.ZodSchema;
  annotations?: ToolAnnotations;
  invocation?: { invoking?: string; invoked?: string };  // OpenAI Apps SDK
  examples?: { request?: JsonValue; response?: JsonValue };
  metadata?: {
    category?: string;
    tags?: string[];
    rateLimit?: { maxCalls: number; windowMs: number };
  };
  taskSupport?: 'forbidden' | 'optional' | 'required';
}
```

## `@Resource` options reference

```ts
interface ResourceOptions {
  uri: string;
  name: string;
  title?: string;
  description: string;
  mimeType?: string;
  size?: number;
  annotations?: ResourceAnnotations;
  examples?: { response?: JsonValue };
  metadata?: { cacheable?: boolean; cacheMaxAge?: number };
}
```

Handler signature: `(uri: string, ctx: ExecutionContext) => Promise<{ contents: Array<{ uri: string; mimeType: string; text: string }> }>`.

## `@Prompt` options reference

```ts
interface PromptOptions {
  name: string;
  title?: string;
  description: string;
  arguments?: Array<{ name: string; description: string; required?: boolean }>;
}
```

Handler signature: `(args, ctx) => Promise<Array<{ role: 'user' | 'assistant' | 'system'; content: string | { type: 'text'; text: string } }>>`.

## Error types

`@nitrostack/core` re-exports its full error hierarchy from `errors.ts`.
Common subclasses cover validation, auth, not-found, and task lifecycle.
Throw the most specific error so `ExceptionFilter`s can map to MCP error codes.

## MIME-type constants

| Constant | Value | Notes |
|---|---|---|
| `WIDGET_MIME_TYPE` | `text/html` | Cross-compat default |
| `MCP_APPS_MIME_TYPE` | `text/html` | Strict MCP Apps spec |
| `OPENAI_SKYBRIDGE_MIME_TYPE` | `text/html+skybridge` | Strict OpenAI ChatGPT |

Use these instead of inlining strings — they switch alongside upstream specs.
