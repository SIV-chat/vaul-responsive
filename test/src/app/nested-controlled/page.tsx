import { useState } from 'react';
import { Drawer } from 'vaul-responsive';

export default function Page() {
  const [nestedOpen, setNestedOpen] = useState(false);
  const [closeCount, setCloseCount] = useState(0);

  return (
    <div>
      <div data-testid="close-count">{closeCount}</div>
      <Drawer.Root presentation="drawer">
        <Drawer.Trigger asChild>
          <button data-testid="trigger">Open Drawer</button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay />
          <Drawer.Content data-testid="content">
            <Drawer.Title>Parent</Drawer.Title>
            <button data-testid="open-nested" onClick={() => setNestedOpen(true)}>
              Open nested through state
            </button>
            {/* The consumer's own `onClose` must not replace the one that tells the parent. */}
            <Drawer.NestedRoot
              presentation="drawer"
              open={nestedOpen}
              onOpenChange={setNestedOpen}
              onClose={() => setCloseCount((count) => count + 1)}
            >
              <Drawer.Trigger data-testid="nested-trigger">Open nested through its trigger</Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay />
                <Drawer.Content data-testid="nested-content">
                  <Drawer.Title>Nested drawer</Drawer.Title>
                  <button data-testid="close-nested" onClick={() => setNestedOpen(false)}>
                    Close through state
                  </button>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.NestedRoot>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
