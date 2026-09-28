# vaul-responsive

A fork of [Vaul](https://github.com/emilkowalski/vaul) 1.1.2 (unmaintained upstream) that adds a dialog presentation and on-screen keyboard handling to the drawer.

A drawer can switch between a bottom/side drawer and a centered dialog **without remounting its content**. Vaul's `Content` is already a Radix `Dialog.Content`, so switching keeps that element mounted and only turns the drawer behavior on or off. Form state, uncontrolled input values, focus and scroll position all survive a switch, for example when a window is resized across a breakpoint.

Otherwise the API and the drawer's built-in styles are Vaul's. See [Changes from Vaul](#changes-from-vaul) for what differs.

## Install

```sh
bun add vaul-responsive
```

## Usage

```tsx
import { Drawer } from 'vaul-responsive';

<Drawer.Root>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Overlay className="fixed inset-0 bg-black/40" />
    <Drawer.Content className="fixed inset-x-0 bottom-0 data-[vaul-dialog]:inset-auto data-[vaul-dialog]:top-1/2 data-[vaul-dialog]:left-1/2 data-[vaul-dialog]:-translate-1/2">
      <Drawer.Title>Edit profile</Drawer.Title>
      <input name="name" />
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>;
```

The styles are injected when the package is imported. They are also exported as `vaul-responsive/style.css`.

## New Root props

| Prop                | Type                                   | Default        | Description                                                                                                                    |
| ------------------- | -------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `presentation`      | `'drawer' \| 'dialog' \| 'responsive'` | `'responsive'` | `responsive` switches between drawer and dialog at the breakpoint, `drawer` is plain Vaul, `dialog` drops the drawer behavior. |
| `dialogBreakpoint`  | `number`                               | `768`          | Viewport width in px from which `responsive` presents as a dialog. Below it, and during SSR, it is a drawer.                   |
| `keyboardTopOffset` | `number`                               | `26`           | Space in px kept free above a drawer resting on the keyboard, below the top safe area.                                         |

## Dialog presentation

The dialog presentation turns off:

- Dragging, snap point transforms and the nested-drawer scaling
- Vaul's body `position: fixed` (Radix's own scroll lock still applies)
- `shouldScaleBackground` and the keyboard handling
- Every built-in drawer style, including the slide and fade animations and `user-select: none`

On switching to a dialog, the inline `transform`/`transition` Vaul wrote on the content and the inline `opacity`/`transition` on the overlay are restored to what they were. The active snap point is kept and re-applied when it switches back to a drawer.

Its only built-in style is the animation: it fades and scales in from 0.96 over 150ms and out over 100ms, and the overlay fades with it. Tune the timing with `--vaul-dialog-enter-duration` and `--vaul-dialog-exit-duration`. Positioning is yours, keyed on these attributes:

| Attribute                  | On                       | Present when                 |
| -------------------------- | ------------------------ | ---------------------------- |
| `data-vaul-drawer`         | Content                  | drawer (unchanged from Vaul) |
| `data-vaul-dialog`         | Content                  | dialog                       |
| `data-vaul-overlay`        | Overlay                  | drawer (unchanged from Vaul) |
| `data-vaul-dialog-overlay` | Overlay                  | dialog                       |
| `data-vaul-presentation`   | Content, Overlay, Handle | always, `drawer` or `dialog` |

Radix waits for a CSS animation on `data-state="closed"` before it unmounts, so an exit animation keyed on that attribute plays as usual.

## On-screen keyboard

With `repositionInputs` (on by default), while a field inside a bottom drawer has focus and the on-screen keyboard is up:

- the drawer rests on the keyboard (inline `bottom`) and fits the visible area (inline `max-height`, minus the top safe area and `keyboardTopOffset`);
- a drawer with snap points moves to its last snap point, and back to the previous one when the keyboard closes, through `setActiveSnapPoint`;
- the focused field is scrolled into view inside the drawer's own scroll container, so the page never pans; this also covers moving between fields with the keyboard's previous/next buttons.

iOS Safari only shrinks the visual viewport for the keyboard, which is what this corrects. Android also shrinks the layout viewport, so a `bottom: 0` drawer already moves and nothing is written.

While the keyboard is up the content also gets `data-vaul-keyboard="open"`, `--vaul-keyboard-inset` and `--vaul-visible-height`. Set `repositionInputs={false}` to handle the keyboard yourself.

## Changes from Vaul

Breaking:

- `presentation` defaults to `responsive`: from `dialogBreakpoint` (768px) up, a drawer presents as a dialog. Pass `presentation="drawer"` for side drawers and anywhere Vaul's behavior should stay at every width.
- `disablePreventScroll` is removed, along with the iOS focus workaround behind it. That workaround called `preventDefault()` on `touchend` and focused fields itself, which put the caret at the start of tapped fields. Radix's scroll lock and the keyboard handling above replace it.
- `fixed` is removed; the keyboard handling fits the drawer to the visible area instead.
- `repositionInputs` now works as described above. The old version wrote an inline `height` and `bottom` that were never cleared.
- The overlay handles release on `pointerup` instead of `mouseup`.

Other:

- Listeners (resize, viewport, keyboard) are only attached while the drawer is open, and resize is coalesced per frame.
- Drag state no longer lives in React state and the context value is memoized, so children don't re-render during a drag.
- Release velocity is measured over the last 100ms of the drag, so a slow drag that ends in a flick reads as a flick.
- `snapPoints` can be an inline array. Snap points are compared by value, so a parent that re-renders no longer snaps the drawer back, which in Vaul froze it during a drag.
- A controlled `activeSnapPoint` no longer re-runs the drawer's effects on every change, so moving off the last snap point while the keyboard is up sticks, as it does uncontrolled.
- `onPointerDown`, `onPointerMove` and `onFocusOutside` passed to `Content` are always called, also with `handleOnly`.
- `prefers-reduced-motion: reduce` makes the drawer's animations and transitions instant.
- `useDrawerContext` and the `DrawerContextValue` type are exported, and `@types/react` is an optional peer dependency.

Fixes from open upstream pull requests:

- `modal={false}` also leaves the page clickable when the drawer opens through a controlled `open` prop (#576).
- Scrolled ancestors above the drawer no longer block dragging a drawer that isn't `position: fixed` (#654).
- `data-vaul-no-drag` elements don't get pointer capture, which swallowed their clicks, e.g. inputs in shadow DOM (#293).
- The background scales while dragging with `modal={false}` too (#595), and keeps the safe-area offset while dragging instead of jumping (#557).
- Transient `visualViewport` heights under 80px (WKWebView UI transitions) are ignored by the keyboard handling (#636).
- The handle's invalid hit-area rule (a stray colon, #531 and #659) is removed; the hit area stays 44px as before.

## Development

```sh
bun install
bun run build       # the package
bun run dev:test    # Vite test app on :3000
bun run test        # build, then Playwright on iPhone and Pixel
bun run check       # types
bun run lint        # oxlint
bun run format      # oxfmt
```

## License

MIT, © Emil Kowalski. Dialog presentation and keyboard handling by Siv.
