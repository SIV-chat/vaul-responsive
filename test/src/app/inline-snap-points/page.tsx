import { useEffect, useState } from 'react';
import { Drawer } from 'vaul-responsive';

export default function Page() {
  // A parent that keeps re-rendering, so the inline `snapPoints` array is new on every render.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div>
      <div data-testid="tick">{tick}</div>
      <Drawer.Root open snapPoints={['148px', '355px', 1]}>
        <Drawer.Portal>
          <Drawer.Overlay />
          <Drawer.Content data-testid="content">
            <p>Drag me while the page re-renders.</p>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
