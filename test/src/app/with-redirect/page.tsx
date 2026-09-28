import { Link } from '../../router';
import { Drawer } from 'vaul-responsive';

export default function Page() {
  return (
    <div>
      <Drawer.Root>
        <Drawer.Trigger asChild>
          <button data-testid="trigger">Open Drawer</button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay data-testid="overlay" />
          <Drawer.Content data-testid="content">
            <Drawer.Close data-testid="drawer-close">Close</Drawer.Close>
            <div>
              <div />
              <div>
                <Drawer.Title>Redirect to another route.</Drawer.Title>
                <p>This route is only used to test the body reset position.</p>
                <p>
                  Go to{' '}
                  <Link href="/with-redirect/long-page" data-testid="link">
                    another route
                  </Link>{' '}
                </p>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
