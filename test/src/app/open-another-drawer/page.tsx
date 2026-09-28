import { Drawer } from 'vaul-responsive';
import { useState } from 'react';

export function MyDrawer({
  open,
  setOpen,
  setOpen2,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  setOpen2: (open: boolean) => void;
}) {
  return (
    <Drawer.Root open={open}>
      <Drawer.Trigger asChild onClick={() => setOpen(true)}>
        <button>Open Drawer</button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content>
          <div>
            <div />
            <div>
              <Drawer.Title>Unstyled drawer for React.</Drawer.Title>

              <button
                type="button"
                onClick={() => {
                  setOpen2(true);
                  setOpen(false);
                }}
              >
                Open new drawer and close this
              </button>
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
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
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
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
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

export function MyDrawer2({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  return (
    <Drawer.Root open={open}>
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content>
          <div>
            <div />
            <div>
              <Drawer.Title>Unstyled drawer for React.</Drawer.Title>
              <p>This component can be used as a replacement for a Dialog on mobile and tablet devices.</p>
              <p>
                It uses{' '}
                <a href="https://www.radix-ui.com/docs/primitives/components/dialog" target="_blank">
                  Radix&rsquo;s Dialog primitive
                </a>{' '}
                under the hood and is inspired by{' '}
                <a href="https://twitter.com/devongovett/status/1674470185783402496" target="_blank">
                  this tweet.
                </a>
              </p>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Close this
              </button>
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
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
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
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
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

export default function Home() {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);

  return (
    <div>
      <p style={{ paddingBottom: '120vh' }}>scroll down</p>
      <MyDrawer open={open} setOpen={setOpen} setOpen2={setOpen2} />
      <MyDrawer2 open={open2} setOpen={setOpen2} />
      <p>scroll down</p>
    </div>
  );
}
