---
name: lint
description: "Run Baileys lint suite: eslint (TypeScript), tsc (type check). Use when: verifying code quality, checking for errors, running lint, before committing."
---

# Baileys Lint Suite

## When to Use
- After code changes, before committing
- To verify code quality
- When asked to check for lint or type errors

## Lint + Typecheck

Run from repo root:

```bash
npm run lint                           # tsc + eslint
```

Or individually:

```bash
npx eslint .                           # Lint
npx tsc --noEmit                       # Type check
```

## Sidecar

Run from `sidecar/`:

```bash
npx eslint .                           # Lint
npx tsc --noEmit                       # Type check
```

## Procedure

1. Run lint (`npm run lint` or `npx eslint .`)
2. Run type check (`npx tsc --noEmit`)
3. If sidecar files changed, also lint `sidecar/`
4. Report all errors found
5. Fix any issues and re-run until clean
