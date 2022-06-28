import React, { useState, useCallback } from 'react';
import { ValueNotifier, useListen } from './listenable';
export * from './listenable';

export class SharedState<T> extends ValueNotifier<T> {}

/**
 * Hook a shared state. Will re-render the component and get the latest value after state change
 *
 * @param sharedState Shared state to hook
 * @param shouldUpdate Boolean or function to decide whether to re-render current component when the shared state change
 */
export function useSharedState<T>(
  sharedState: SharedState<T>,
  shouldUpdate: boolean | ((current: T, previous: T) => boolean) = true,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(sharedState.getValue());

  const listener = (current: T, previous: T) => {
    if (
      shouldUpdate === false ||
      (shouldUpdate instanceof Function && !shouldUpdate(current, previous))
    ) {
      // If the `shouldUpdate` is or returns false, do not update state
      return;
    }
    setState(current);
  };

  const onListen = () => {
    // If the state changed before the listener is added, notify the listener
    if (sharedState.getValue() !== state) {
      listener(sharedState.getValue(), state);
    }
  };

  useListen(sharedState, listener, onListen);

  // return the same function object between renderings
  const setSharedState = useCallback(
    (v: React.SetStateAction<T>) => {
      sharedState.setValue(v);
    },
    [sharedState],
  );

  return [sharedState.getValue(), setSharedState];
}
