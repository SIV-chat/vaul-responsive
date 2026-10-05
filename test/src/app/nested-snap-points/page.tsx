import { Drawer } from 'vaul-responsive';

const snapPoints = ['300px', 1];

export default function Page() {
  return (
    <div>
      <Drawer.Root snapPoints={snapPoints} presentation="drawer">
        <Drawer.Trigger asChild>
          <button data-testid="trigger">Open Drawer</button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay />
          <Drawer.Content data-testid="content">
            <Drawer.Title>Parent with snap points</Drawer.Title>
            <Drawer.NestedRoot presentation="drawer">
              <Drawer.Trigger data-testid="nested-trigger">Open nested drawer</Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay />
                <Drawer.Content data-testid="nested-content">
                  <Drawer.Title>Nested drawer</Drawer.Title>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.NestedRoot>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
