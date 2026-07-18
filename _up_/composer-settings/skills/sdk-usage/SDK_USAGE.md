---
name: sdk-usage
description: >-
  Best practices and tools for managing NitroStack SDK versions across projects.
  Ensures all generated apps always use the latest @nitrostack/* packages and
  provides a command to upgrade existing projects to the latest SDK versions.
---

# SDK Version Management

This guide explains how NitroStudio ensures generated projects always use the latest NitroStack SDK versions, and how to manually upgrade existing projects.

## Automatic Latest During Project Creation

When you create a new NitroStack project (TypeScript or Python) via the Composer or Onboarding flow, the following happens automatically:

1. **Scaffold with CLI**: `npx @nitrostack/cli@latest init <project-name> --template <template-name>`
   - Uses `@latest` tag to ensure the latest CLI version is invoked
   - Generates project structure with initial dependencies

2. **Upgrade to Latest SDK**: `npx @nitrostack/cli@latest upgrade --latest`
   - Automatically runs after scaffolding completes
   - Ensures all `@nitrostack/*` packages are set to their latest versions in `package.json`
   - Re-runs `npm install` to fetch latest versions from npm registry

3. **Result**: Your new project has `@nitrostack/core`, `@nitrostack/widgets`, and other packages pinned to the latest available versions, not stale defaults from the CLI's templates.

### Affected Packages

The `upgrade --latest` step updates all of these to their latest versions:

| Package | Purpose |
|---------|---------|
| `@nitrostack/core` | Server framework, DI, decorators, tools, resources |
| `@nitrostack/widgets` | React SDK for widget UI components |
| `@nitrostack/cli` | Command-line scaffolding and dev tools |
| Any other `@nitrostack/*` | Future packages added to the ecosystem |

## Manually Upgrading Existing Projects

If you have an existing NitroStack project (created before this feature or generated elsewhere), you can upgrade all SDKs to the latest versions using the Composer:

### Option 1: Composer Command (Recommended)

In a Compose session with an existing project loaded:

```
Upgrade my project's SDK to the latest version
```

The Composer will invoke the `compose_upgrade_sdk()` command, which:
1. Runs `npx @nitrostack/cli@latest upgrade --latest` in your project
2. Streams the output so you can see progress
3. Re-installs dependencies with the latest SDK versions

### Option 2: Manual CLI

From your project root, run:

```bash
npx @nitrostack/cli@latest upgrade --latest
```

Or interactively (with prompts for each version):

```bash
npx @nitrostack/cli@latest upgrade
```

For a dry-run (preview only, no changes):

```bash
npx @nitrostack/cli@latest upgrade --dry-run
```

## How This Works Under the Hood

### Project Creation (Rust Backend)

In `src-tauri/src/commands/projects.rs`:

```rust
// After `create_nitro_project()` scaffolds via npx init...
let upgrade_result = upgrade_project_sdk(&project_path, &app).await;
```

The `upgrade_project_sdk()` function spawns `npx @nitrostack/cli@latest upgrade --latest` and streams output to the UI.

### Composer Upgrade Command (Rust Backend)

In `src-tauri/src/commands/compose.rs`:

```rust
#[tauri::command]
pub async fn compose_upgrade_sdk(project_root: String, app: AppHandle) -> Result<String, String>
```

This command is exposed to the Composer agent, allowing it to offer SDK upgrade as a development action.

### Frontend Wrapper (TypeScript)

In `lib/tauri.ts`:

```typescript
export async function upgradeProjectSdk(projectPath: string): Promise<string>
```

This wraps the Tauri command for use in React components and agent tools.

## Why This Matters

### Problem

The default templates bundled in `@nitrostack/cli` may include pinned or slightly stale versions of `@nitrostack/core`, `@nitrostack/widgets`, etc. This means:

- New projects inherit old package versions from the template
- Bug fixes and features in the latest SDK are not immediately available
- Composio and other integrations may rely on recent SDK improvements

### Solution

By running `upgrade --latest` immediately after scaffolding:

✅ New projects always have the latest SDK versions  
✅ No stale templates or cached versions  
✅ Instant access to latest features and bug fixes  
✅ Better compatibility with Studio and Composer features  

## Best Practices

1. **Always upgrade on first use** — if you create a project via CLI directly (not through Studio), run `upgrade --latest` immediately.

2. **Check for upgrades regularly** — if you work on a project for weeks, periodically ask the Composer to upgrade to ensure you're not missing critical fixes.

3. **Test after upgrading** — run `npm run dev` to verify your project still works with the new SDK versions. Breaking changes are rare but possible.

4. **Review upgrade output** — the upgrade command shows you which packages changed. Check the output for any warnings.

## Troubleshooting

### "SDK upgrade failed" in Composer

If the Composer reports an error during `upgrade --latest`:

1. Check your project's `package.json` — ensure it's a valid NitroStack project
2. Verify Node/npm are working: `npm --version`, `node --version`
3. Try manually: `cd <project> && npx @nitrostack/cli@latest upgrade --latest`
4. If that succeeds, the issue was transient; try again in Composer
5. If it fails, report the error output — there may be a compatibility issue

### "package.json not found" or permission errors

Ensure the project path is correct and you have read/write permission to the directory.

## Reference

- **CLI Upgrade Command**: `nitrostack-cli upgrade [--dry-run] [--latest]`
- **Latest CLI**: `npm install -g @nitrostack/cli@latest`
- **More on the CLI**: See [nitrostack-cli/SKILL.md](../nitrostack-cli/SKILL.md)

## Python Projects

### Creating Python Projects

When you choose the **Python** SDK type during project creation:

1. **Choose Python template** — Select from the same template names as TypeScript:
   - **Starter** (maps to Python `calculator` template) — Simple addition tool
   - **Advanced** (maps to Python `food-delivery` template) — Food delivery with status tracking
   - **OAuth** (maps to Python `flight-booking` template) — Flight booking with OAuth 2.1

2. **Create with nitrostack-py** — `python -m nitrostack.cli init <name> --template <template>`

3. **Upgrade to latest SDK** — `pip install --upgrade nitrostack`

### Requirements

**Python 3.10+** is required to create Python projects. The environment check will:
- Detect Python 3.10 or later
- Show a clear message if Python is missing or too old
- Disable Python project option if Python is not available

### Template Mapping

| UI Template | Python CLI Template | Use Case |
|-------------|-------------------|----------|
| Starter | `calculator` | Simple MCP server with basic tool |
| Advanced | `food-delivery` | Full-featured with multiple tools and state |
| OAuth | `flight-booking` | OAuth 2.1 authentication example |

### Upgrading Python Projects

If you have an existing Python project created before auto-upgrade was available:

**Option 1: Composer Command** (Recommended)
```
Upgrade my Python project's SDK
```

**Option 2: Manual pip**
```bash
pip install --upgrade nitrostack
```

## FAQ

**Q: Why not always use `@latest` in package.json?**  
A: That would re-fetch the latest version on every `npm install`, making builds non-deterministic and potentially breaking projects if SDK releases introduce incompatibilities. We upgrade at creation time, then lock versions for stability.

**Q: What if I want to stay on a specific SDK version?**  
A: After upgrading, edit `package.json` and manually set the version (e.g., `"@nitrostack/core": "1.0.50"` instead of `^1.0.83`). Then run `npm install`. This is useful for pinning to a known-good version.

**Q: Does this affect the Studio app itself?**  
A: No. NitroStudio's own `package.json` pins `"nitrostack": "^1.0.83"` for stability. Only generated projects upgrade to latest.

**Q: Can I use this with Python projects?**  
A: Currently, the upgrade command is for TypeScript/Node projects using `@nitrostack/cli`. Python SDK projects would need their own upgrade mechanism (future enhancement).
