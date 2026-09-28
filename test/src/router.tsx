import React from 'react';

// Each `app/<route>/page.tsx` is served at `/<route>`, like the file layout implies.
const pages = import.meta.glob<{ default: React.ComponentType }>('./app/**/page.tsx', { eager: true });

const routes = new Map(
  Object.entries(pages).map(([file, module]) => {
    const route = file.replace(/^\.\/app/, '').replace(/\/page\.tsx$/, '');
    return [route || '/', module.default];
  }),
);

const NAVIGATE_EVENT = 'test:navigate';

function usePathname() {
  const [pathname, setPathname] = React.useState(() => window.location.pathname);

  React.useEffect(() => {
    const onChange = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onChange);
    window.addEventListener(NAVIGATE_EVENT, onChange);
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener(NAVIGATE_EVENT, onChange);
    };
  }, []);

  return pathname;
}

/** Client-side navigation, so a drawer unmounts without a page reload. */
export function Link({ href, onClick, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        window.history.pushState(null, '', href);
        window.dispatchEvent(new Event(NAVIGATE_EVENT));
      }}
      {...props}
    />
  );
}

export function Router() {
  const pathname = usePathname();
  const Page = routes.get(pathname.replace(/\/$/, '') || '/');

  if (!Page) return <p className="p-8">No test page at {pathname}</p>;
  return <Page />;
}
