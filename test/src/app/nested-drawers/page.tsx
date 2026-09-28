import { Drawer } from 'vaul-responsive';

export default function Page() {
  return (
    <div data-vaul-drawer-wrapper="">
      <Drawer.Root>
        <Drawer.Trigger asChild>
          <button data-testid="trigger">Open Drawer</button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay />
          <Drawer.Content data-testid="content">
            <div>
              <div />
              <div>
                <Drawer.Title>Drawer for React.</Drawer.Title>
                <p>This component can be used as a Dialog replacement on mobile and tablet devices.</p>
                <p>It comes unstyled and has gesture-driven animations.</p>
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
                <Drawer.NestedRoot>
                  <Drawer.Trigger data-testid="nested-trigger">Open Second Drawer</Drawer.Trigger>
                  <Drawer.Portal>
                    <Drawer.Overlay />
                    <Drawer.Content data-testid="nested-content">
                      <Drawer.Close data-testid="nested-close">Close</Drawer.Close>
                      <div>
                        <div />
                        <div>
                          <Drawer.Title>This drawer is nested.</Drawer.Title>
                          <p>
                            Place a <span>`Drawer.NestedRoot`</span> inside another drawer and it will be nested
                            automatically for you.
                          </p>
                          <p>
                            You can view more examples{' '}
                            <a href="https://github.com/emilkowalski/vaul#examples" target="_blank">
                              here
                            </a>
                            .
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
                </Drawer.NestedRoot>
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
