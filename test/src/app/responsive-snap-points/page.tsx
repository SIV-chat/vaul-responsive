import { Drawer } from 'vaul-responsive';

const snapPoints = ['148px', 1];

export default function Page() {
  return (
    <div data-vaul-drawer-wrapper="" data-testid="wrapper">
      <Drawer.Root snapPoints={snapPoints} shouldScaleBackground>
        <Drawer.Trigger asChild>
          <button data-testid="trigger">Open Drawer</button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay data-testid="overlay" />
          <Drawer.Content data-testid="content">
            <Drawer.Title>Responsive drawer with snap points</Drawer.Title>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
