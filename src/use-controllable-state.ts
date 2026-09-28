// This code comes from https://github.com/radix-ui/primitives/blob/main/packages/react/use-controllable-state/src/useControllableState.tsx

import React from 'react';
import { useLatestRef } from './use-latest-ref';

type UseControllableStateParams<T> = {
  prop?: T | undefined;
  defaultProp?: T | undefined;
  onChange?: (state: T) => void;
};

function useUncontrolledState<T>({ defaultProp, onChange }: Omit<UseControllableStateParams<T>, 'prop'>) {
  const uncontrolledState = React.useState<T | undefined>(defaultProp);
  const [value] = uncontrolledState;
  const prevValueRef = React.useRef(value);
  const onChangeRef = useLatestRef(onChange);

  React.useEffect(() => {
    if (prevValueRef.current !== value) {
      onChangeRef.current?.(value as T);
      prevValueRef.current = value;
    }
  }, [value, onChangeRef]);

  return uncontrolledState;
}

export function useControllableState<T>({ prop, defaultProp, onChange }: UseControllableStateParams<T>) {
  const [uncontrolledProp, setUncontrolledProp] = useUncontrolledState({ defaultProp, onChange });
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledProp;
  const onChangeRef = useLatestRef(onChange);

  const setValue = React.useCallback(
    (nextValue: T | undefined) => {
      if (isControlled) {
        if (nextValue !== prop) onChangeRef.current?.(nextValue as T);
      } else {
        setUncontrolledProp(nextValue);
      }
    },
    [isControlled, prop, onChangeRef, setUncontrolledProp],
  );

  return [value, setValue] as const;
}
