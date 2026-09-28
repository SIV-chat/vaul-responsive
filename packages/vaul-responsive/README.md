# vaul-responsive

A fork of [Vaul](https://github.com/emilkowalski/vaul) 1.1.2 (unmaintained upstream) that adds a dialog presentation to the drawer.

A drawer can switch between a bottom/side drawer and a centered dialog **without remounting its content**. Vaul's `Content` is already a Radix `Dialog.Content`, so switching keeps that element mounted and only turns the drawer behavior on or off. Form state, uncontrolled input values, focus and scroll position all survive a switch, for example when a window is resized across a breakpoint.

Everything else is Vaul as-is: same API, same drawer defaults.

## Install

```sh
bun add vaul-responsive
```

## Usage

```tsx
import { Drawer } from 'vaul-responsive';

<Drawer.Root presentation="responsive">
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

### Root props

| Prop               | Type                                   | Default    | Description                                                                                                       |
| ------------------ | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `presentation`     | `'drawer' \| 'dialog' \| 'responsive'` | `'drawer'` | `drawer` is plain Vaul, `dialog` drops the drawer behavior, `responsive` switches between them at the breakpoint. |
| `dialogBreakpoint` | `number`                               | `768`      | Viewport width in px from which `responsive` presents as a dialog. Below it, and during SSR, it is a drawer.      |

With the default `presentation` the component behaves exactly like Vaul.

### What the dialog presentation turns off

- Dragging, snap point transforms and the nested-drawer scaling
- Vaul's body `position: fixed` and iOS scroll handling (Radix's own scroll lock still applies)
- `shouldScaleBackground` and `repositionInputs`
- Every built-in drawer style, including the slide and fade animations and `user-select: none`

On switching to a dialog, the inline `transform`/`transition` Vaul wrote on the content and the inline `opacity`/`transition` on the overlay are cleared. The active snap point is kept and re-applied when it switches back to a drawer.

### Styling

The dialog presentation ships no styles, so position and animate it yourself. These attributes are available:

| Attribute                  | On                       | Present when                 |
| -------------------------- | ------------------------ | ---------------------------- |
| `data-vaul-drawer`         | Content                  | drawer (unchanged from Vaul) |
| `data-vaul-dialog`         | Content                  | dialog                       |
| `data-vaul-overlay`        | Overlay                  | drawer (unchanged from Vaul) |
| `data-vaul-dialog-overlay` | Overlay                  | dialog                       |
| `data-vaul-presentation`   | Content, Overlay, Handle | always, `drawer` or `dialog` |

Radix waits for a CSS animation on `data-state="closed"` before it unmounts, so an exit animation keyed on that attribute plays as usual.

## Development

```sh
bun install
bun run build
bun run dev:test   # Next.js test app on :3000
bun run test       # Playwright
```

## License

MIT, © Emil Kowalski. Dialog presentation by Siv.
