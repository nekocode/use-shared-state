import React, { useState, useRef, useCallback } from 'react';
import { ValueNotifier, useListen } from './listenable';
export * from './listenable';

export class SharedState<T> extends ValueNotifier<T> {}

/**
 * Hook a shared state to component
 *
 * @param sharedState Shared state to hook
 * @param shouldUpdate Boolean or function to decide whether to re-render current component when the value of the shared state changes
 */
export function useSharedState<T>(
  sharedState: SharedState<T>,
  shouldUpdate: boolean | ((current: T, prev: T) => boolean) = true,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [, setState] = useState<T>(sharedState.getValue());
  const shouldUpdateRef = useRef<
    boolean | ((current: T, prev: T) => boolean)
  >();
  shouldUpdateRef.current = shouldUpdate;

  const listener = useCallback(
    (current: T, prev: T) => {
      const f = shouldUpdateRef.current;
      if (f === false || (f instanceof Function && !f(current, prev))) {
        // If the `shouldUpdate` is or returns false, do not update state
        return;
      }

      setState(current);
    },
    [setState],
  );

  useListen(sharedState, listener);

  // return the same function object between renderings
  const setSharedState = useCallback(
    (v: React.SetStateAction<T>) => {
      sharedState.setValue(v);
    },
    [sharedState],
  );

  return [sharedState.getValue(), setSharedState];
}
