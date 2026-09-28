import { Drawer } from 'vaul-responsive';

export default function Page() {
  return (
    <div className="w-screen h-screen bg-white p-8 flex justify-center items-center">
      <Drawer.Root>
        <Drawer.Trigger asChild>
          <button data-testid="trigger" className="text-2xl">
            Open Drawer
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay data-testid="overlay" className="fixed inset-0 bg-black/40" />
          <Drawer.Content
            data-testid="content"
            className="bg-zinc-100 flex flex-col rounded-t-[10px] fixed bottom-0 left-0 right-0 p-4 data-[vaul-dialog]:inset-auto data-[vaul-dialog]:top-1/2 data-[vaul-dialog]:left-1/2 data-[vaul-dialog]:-translate-x-1/2 data-[vaul-dialog]:-translate-y-1/2 data-[vaul-dialog]:rounded-[10px]"
          >
            <Drawer.Title className="font-medium mb-4">Responsive drawer</Drawer.Title>
            <input data-testid="uncontrolled" aria-label="Uncontrolled" className="border p-2" />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
