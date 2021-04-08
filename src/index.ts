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
  const updateState = useState<T>(sharedState.getValue())[1];
  const shouldUpdateRef = useRef<
    boolean | ((current: T, prev: T) => boolean)
  >();
  shouldUpdateRef.current = shouldUpdate;

  const listener = useCallback(
    (current: T, prev: T) => {
      const l = shouldUpdateRef.current;
      if (l === false || (l instanceof Function && !l(current, prev))) {
        // If the `shouldUpdate` is or returns false, do not update state
        return;
      }

      updateState(current);
    },
    [updateState],
  );

  useListen(sharedState, listener);

  const setSharedState = useCallback(
    (v: React.SetStateAction<T>) => {
      sharedState.setValue(v);
    },
    [sharedState],
  );

  return [sharedState.getValue(), setSharedState];
}
