# CLAUDE.md

vaul-responsive is a fork of Vaul 1.1.2, a React drawer built on `@radix-ui/react-dialog`. It adds a dialog presentation that switches without remounting, and on-screen keyboard handling. Public docs, props and the full list of changes from Vaul: `packages/vaul-responsive/README.md`. Keep that README in sync with any public API or behavior change.

## Layout

- `packages/vaul-responsive/` — the published package. Source in `src/`, built to `dist/` by bunchee.
- `test/` — Vite + React pages for Playwright. `src/app/<route>/page.tsx` is served at `/<route>` by `src/router.tsx`; specs live in `test/tests/`.
- Root — private Bun workspace: Playwright config, oxlint/oxfmt config, CI.

### Source map

- `root.tsx` — `Root` and `NestedRoot`: open state, presentation, nested-drawer scaling, and the memoized context value.
- `content.tsx` — `Content`, `Overlay`, `Handle`, `Portal`.
- `use-drag.ts` — drag physics: press, move, release, velocity.
- `use-snap-points.ts` — snap offsets and snapping.
- `use-keyboard-avoidance.ts` — keeps a bottom drawer above the on-screen keyboard.
- `use-position-fixed.ts` — Safari body `position: fixed` while open.
- `use-scale-background.ts` — scales `[data-vaul-drawer-wrapper]` behind the drawer.
- `styles.ts` — `setStyles` / `restoreStyles`, the only way to write inline styles.
- `style.css` — built-in drawer styles, injected at import.

## Commands

Bun only; never npm, npx or node.

```sh
bun install
bun run build     # type-check, bunchee, copy style.css
bun run check     # types
bun run lint      # oxlint
bun run format    # oxfmt
bun run test      # build, then Playwright on iPhone (WebKit) and Pixel (Chromium)
bun run dev:test  # test app on :3000
```

Before committing: `bun run lint`, `bunx oxfmt --check`, `bun run check`, and `bun run test` for any behavior change.

## Rules

- **The dialog presentation only ships its enter/exit animation.** Drawer styles key off `data-vaul-drawer` / `data-vaul-overlay`, which are absent in dialog mode; the dialog animation keys off `data-vaul-dialog` / `data-vaul-dialog-overlay` and only animates `opacity` and `scale`, so it never fights the consumer's centering. Positioning, sizes and colors stay with the consumer. Don't change Vaul's drawer defaults (animations, sizes, colors); new behavior is opt-in through props. The one deliberate exception is `presentation`, which defaults to `responsive`.
- **Inline styles go through `setStyles` / `restoreStyles`.** They record the consumer's original value per property, so switching to a dialog or closing the keyboard restores exactly what was there. Never assign `element.style` directly.
- **Nothing runs while a drawer is closed.** Gate window, `visualViewport` and document listeners on `isOpen` (and usually on the presentation being `drawer`), and coalesce high-frequency events to one pass per animation frame.
- **Drag state stays out of React state.** It lives in refs in `use-drag.ts`; handlers are stable through `useStableCallback` / `useLatestRef`, and the context value in `root.tsx` is memoized. A drag must not re-render the drawer's children. Keep pointer-move work free of DOM queries, `getComputedStyle` and allocations.
- **No type or lint escape hatches.** No `as any`, `@ts-ignore` or `oxlint-disable`. Fix the type instead. Also no nested ternaries.
- **Comments explain why, not what.** Upstream comments that explain browser quirks stay.
- **React peer range is 16.8–19.** Don't use APIs newer than the range (e.g. `useSyncExternalStore`, `useId`). JSX uses the classic runtime, so import `React` in `.tsx` files.
- **Keep `'use client'` at the top of `src/index.tsx`.**
- **`sideEffects` in `package.json` must keep `"*.css"`.** Without it bunchee tree-shakes `import './style.css'` and the package ships without styles, while builds and type-checks still pass. If Playwright suddenly fails on handles or snap points, check that `dist/index.mjs` calls `__insertCSS(`.

## Testing

- Playwright only emulates devices. The on-screen keyboard, iOS visual-viewport panning and real touch physics don't exist there. Changes to `use-keyboard-avoidance.ts`, `use-position-fixed.ts` or drag velocity need a check on a real iPhone, and the PR should say whether that happened.
- New pages go in `test/src/app/<route>/page.tsx` with `data-testid`s, and specs in `test/tests/`. Use `openDrawer` from `tests/helpers.ts`: it waits for the open animation, and interacting before that races Radix's outside-pointer listener.
- Only add tests for behavior that matters to consumers; the presentation-switch contract lives in `tests/responsive.spec.ts`.

## Testing inside another app

Linking the folder directly makes Bun install this package's devDependencies too. That gives the app a second `@radix-ui/react-dialog` instance, which splits Radix's layer stack (a popover inside a drawer then counts as an outside click). Pack a tarball instead:

```sh
cd packages/vaul-responsive && bun run build && bun pm pack
# in the app: "vaul-responsive": "file:/abs/path/vaul-responsive-<version>.tgz"
```

Bun keeps using a local tarball whose hash matches the app's `bun.lock`. After repacking the same version, replace only the `sha512-…` integrity on the app's `vaul-responsive` line in `bun.lock` with the new one, delete `node_modules/.bun/vaul-responsive@*`, then `bun install`:

```sh
echo "sha512-$(openssl dgst -sha512 -binary vaul-responsive-<version>.tgz | base64)"
```

Don't delete the lockfile entry or run `bun install --force`: both make Bun re-resolve every dependency in the app's lockfile.

## Publishing

`bun publish` from `packages/vaul-responsive` (`prepublishOnly` builds). Breaking changes bump the major version and are listed under "Changes from Vaul" in the package README.
