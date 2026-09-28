import { useState } from 'react';
import { Drawer } from 'vaul-responsive';

// Drawers live inside the box instead of the viewport.
const containerStyle = { position: 'relative', height: 400, maxWidth: 440, overflow: 'hidden' } as const;
const containedStyle = { position: 'absolute' } as const;
const containedContentStyle = { position: 'absolute', height: '56%' } as const;

export default function Page() {
  return (
    <div>
      <Default />
      <WithNested />
    </div>
  );
}

function Default() {
  const [parent, setParent] = useState<HTMLDivElement | null>(null);

  return (
    <div>
      <h1>Default</h1>
      <div ref={setParent} style={containerStyle}>
        <Drawer.Root container={parent}>
          <Drawer.Trigger>Open Drawer</Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay style={containedStyle} />
            <Drawer.Content style={containedContentStyle}>
              <Drawer.Title>Unstyled drawer for React.</Drawer.Title>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </div>
  );
}

function WithNested() {
  const [parent, setParent] = useState<HTMLDivElement | null>(null);

  return (
    <div>
      <h1>With Nested</h1>
      <div ref={setParent} style={containerStyle}>
        <Drawer.Root>
          <Drawer.Trigger>Open Drawer</Drawer.Trigger>
          <Drawer.Portal container={parent}>
            <Drawer.Overlay style={containedStyle} />
            <Drawer.Content style={containedContentStyle}>
              <Drawer.Title>Unstyled drawer for React.</Drawer.Title>
              <Drawer.NestedRoot container={parent}>
                <Drawer.Trigger>Open nested drawer</Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay style={containedStyle} />
                  <Drawer.Content style={containedContentStyle}>
                    <Drawer.Title>Unstyled drawer for React.</Drawer.Title>
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.NestedRoot>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </div>
  );
}
