import { Drawer, DialogProps } from 'vaul-responsive';

function DirectionalDrawer({
  direction,
  children,
}: {
  direction: DialogProps['direction'];
  children: React.ReactNode;
}) {
  return (
    <Drawer.Root direction={direction}>
      <Drawer.Trigger asChild>
        <button data-testid="trigger">{children}</button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay data-testid="overlay" />
        <Drawer.Content data-testid="content">
          <Drawer.Close data-testid="drawer-close">Close</Drawer.Close>
          <button data-testid="controlled-close">Close</button>
          <div>
            <div />
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
          </div>
          <div>
            <div>
              <a href="https://github.com/emilkowalski/vaul" target="_blank">
                GitHub
                <svg
                  fill="none"
                  height="16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="16"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                  <path d="M15 3h6v6"></path>
                  <path d="M10 14L21 3"></path>
                </svg>
              </a>
              <a href="https://twitter.com/emilkowalski_" target="_blank">
                Twitter
                <svg
                  fill="none"
                  height="16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="16"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                  <path d="M15 3h6v6"></path>
                  <path d="M10 14L21 3"></path>
                </svg>
              </a>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default function Page() {
  return (
    <div>
      <DirectionalDrawer direction="top">Top</DirectionalDrawer>
      <DirectionalDrawer direction="right">Right</DirectionalDrawer>
      <DirectionalDrawer direction="bottom">Bottom</DirectionalDrawer>
      <DirectionalDrawer direction="left">Left</DirectionalDrawer>
    </div>
  );
}
