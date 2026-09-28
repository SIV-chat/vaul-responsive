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
            <Drawer.Title>Responsive drawer</Drawer.Title>
            <input data-testid="uncontrolled" aria-label="Uncontrolled" />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
