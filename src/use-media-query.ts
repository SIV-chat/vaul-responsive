import React from 'react';

/** `false` while `query` is undefined or during server rendering. */
export function useMediaQuery(query: string | undefined) {
  const [matches, setMatches] = React.useState(
    () => query !== undefined && typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  React.useEffect(() => {
    if (query === undefined) {
      setMatches(false);
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    const onChange = () => setMatches(mediaQueryList.matches);
    onChange();
    mediaQueryList.addEventListener('change', onChange);
    return () => mediaQueryList.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
