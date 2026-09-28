import { useState } from 'react';
import { Drawer } from 'vaul-responsive';

export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <div data-vaul-drawer-wrapper="">
      <p>
        Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur
        et. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Maecenas
        faucibus mollis interdum.
      </p>
      <p>
        Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur
        et. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Maecenas
        faucibus mollis interdum.
      </p>
      <p>
        Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur
        et. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Maecenas
        faucibus mollis interdum.
      </p>
      <p>
        Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur
        et. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Maecenas
        faucibus mollis interdum.
      </p>
      <p>
        Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur
        et. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Maecenas
        faucibus mollis interdum.
      </p>
      <p>
        Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur
        et. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Maecenas
        faucibus mollis interdum.
      </p>
      <p>
        Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur
        et. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Maecenas
        faucibus mollis interdum.
      </p>
      <p>
        Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur
        et. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Maecenas
        faucibus mollis interdum.
      </p>
      <p>
        Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur
        et. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Maecenas
        faucibus mollis interdum.
      </p>
      <p>
        Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur
        et. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Maecenas
        faucibus mollis interdum.
      </p>
      <p>
        Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur
        et. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Maecenas
        faucibus mollis interdum.
      </p>
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Trigger asChild onClick={() => setOpen(true)}>
          <button data-testid="trigger">Open Drawer</button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay data-testid="overlay" />
          <Drawer.Content data-testid="content">
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
    </div>
  );
}
