# ColdGuard Frontend

## Scope

This repository contains only the presentation layer of ColdGuard.

Backend domain logic belongs to coldguard-platform.

## Product areas

- Authentication.
- Operational dashboard.
- Asset management.
- Incident management.
- Operational metrics.

## Rules

- Do not invent backend capabilities outside the approved MVP.
- Keep domain rules in the backend.
- Keep API calls behind typed client services.
- Handle loading, empty, error and success states.
- Prioritize accessibility and keyboard navigation.
- Use responsive layouts.
- Optimize web performance.
- Document UX decisions.
- Keep frontend environment configuration separate from secrets.

## Code comments

- In `js`, `jsx`, `mjs`, `ts`, `tsx`, `css` and `html` files, add a comment only when strictly necessary: to explain a non-obvious *why* (a constraint, a trade-off, a workaround). Never restate what the code does.
- Comments in those files are written in English. User-facing copy (UI text) stays in Spanish; documentation in `docs/` stays in Spanish.
- A comment that is no longer true is deleted, not left behind.

## Design system

Before touching any UI, read `docs/ux/design-system.md`, `docs/architecture/component-structure.md` and `.claude/rules/design-system.md`.

- All visual values live in `src/styles/tokens.css`; components use only semantic Tailwind tokens (no palette classes, hex, `dark:`, arbitrary values or inline styles).
- `pnpm lint` enforces these rules and `pnpm build` enforces the bundle budget (`docs/quality/performance-budget.md`).
