import { useState } from 'react';
import { Drawer, type DrawerDirection } from 'vaul-responsive';

const CenteredContent = () => {
  return (
    <div>
      <Drawer.Title>Unstyled drawer for React.</Drawer.Title>
      <p>This component can be used as a replacement for a Dialog on mobile and tablet devices.</p>
      <p>
        It uses{' '}
        <a href="https://www.radix-ui.com/docs/primitives/components/dialog" target="_blank">
          Radix&apos;s Dialog primitive
        </a>{' '}
        under the hood and is inspired by{' '}
        <a href="https://twitter.com/devongovett/status/1674470185783402496" target="_blank">
          this tweet.
        </a>
      </p>
    </div>
  );
};

const DrawerContent = () => {
  return (
    <Drawer.Content data-testid="content">
      <div>
        <div />
        <div>
          <CenteredContent />
        </div>
      </div>
    </Drawer.Content>
  );
};

export default function Page() {
  const [direction, setDirection] = useState<DrawerDirection>('bottom');

  return (
    <div data-vaul-drawer-wrapper="">
      <select value={direction} onChange={(e) => setDirection(e.target.value as DrawerDirection)}>
        <option value="top">Top</option>
        <option value="bottom">Bottom</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>
      <Drawer.Root shouldScaleBackground direction={direction}>
        <Drawer.Trigger asChild>
          <button data-testid="trigger">Open Drawer</button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay data-testid="overlay" />
          <DrawerContent />
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
