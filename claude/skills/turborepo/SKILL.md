---
name: turborepo
description: This skill should be used when the user asks about "turborepo", "monorepo setup", "workspace configuration", "turbo.json", "pipeline configuration", "build caching", "remote caching", "task orchestration", "dependency graph", or mentions "turbo run", "turbo build", "turbo dev". Provides guidance for Turborepo monorepo management.
---

# Turborepo Monorepo Management

Guides you through setting up and managing Turborepo monorepos with best practices.

## Quick Start

1. **Initialize**: `npx create-turbo@latest` or add to existing monorepo
2. **Configure**: Set up `turbo.json` with pipeline definitions
3. **Run tasks**: Use `turbo run <task>` for cached task execution
4. **Optimize**: Enable remote caching for CI/CD

## turbo.json Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    }
  }
}
```

## Workspace Structure

```
my-turborepo/
├── apps/
│   ├── web/          # Next.js app
│   └── docs/         # Documentation site
├── packages/
│   ├── ui/           # Shared UI components
│   ├── config/       # Shared configurations
│   └── tsconfig/     # Shared TypeScript configs
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

## Common Commands

```bash
# Run build in all workspaces
turbo run build

# Run dev in specific workspace
turbo run dev --filter=web

# Run with dependency awareness
turbo run build --filter=web...

# Prune for deployment
turbo prune --scope=web
```

## Remote Caching

Enable remote caching for faster CI builds:

```bash
# Login to Vercel
npx turbo login

# Link to remote cache
npx turbo link
```

## Best Practices

1. **Keep pipelines simple**: Define clear task dependencies
2. **Use filters**: Target specific workspaces to reduce build time
3. **Cache outputs**: Define all build outputs for effective caching
4. **Shared configs**: Centralize ESLint, TypeScript, and other configs
5. **Internal packages**: Use `"main": "./src/index.ts"` for development

## Troubleshooting

- **Cache misses**: Check `globalDependencies` and `inputs` configuration
- **Circular dependencies**: Review workspace imports with `turbo run build --graph`
- **Slow builds**: Enable remote caching and check pipeline dependencies
