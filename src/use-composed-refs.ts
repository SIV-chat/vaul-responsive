// Adapted from https://github.com/radix-ui/primitives/tree/main/packages/react/compose-refs

import * as React from 'react';
import { useLatestRef } from './use-latest-ref';

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

/** Composes callback refs and ref objects into one stable callback ref. */
export function useComposedRefs<T>(...refs: PossibleRef<T>[]) {
  const refsRef = useLatestRef(refs);
  return React.useCallback((node: T) => refsRef.current.forEach((ref) => setRef(ref, node)), [refsRef]);
}
