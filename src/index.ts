/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useCallback } from 'react';
import { ValueNotifier } from './listenable';
export * from './listenable';

const createMutableSource = (React as any).unstable_createMutableSource;
const useMutableSource = (React as any).unstable_useMutableSource;

export class SharedState<T> extends ValueNotifier<T> {
  public source: any;

  public constructor(protected value: T) {
    super(value);
    this.source = createMutableSource(this, () => this.getValue());
  }
}

function getSnapshot<T>(sharedState: SharedState<T>) {
  return sharedState.getValue();
}

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
  const shouldUpdateRef =
    useRef<boolean | ((current: T, prev: T) => boolean)>();
  shouldUpdateRef.current = shouldUpdate;

  const subscribe = useCallback(
    (sharedState: SharedState<T>, callback: () => void) => {
      const listener = (current: T, prev: T) => {
        const f = shouldUpdateRef.current;
        if (f === false || (f instanceof Function && !f(current, prev))) {
          // If the `shouldUpdate` is or returns false, do not update state
          return;
        }

        callback();
      };

      sharedState.addListener(listener);
      return () => sharedState.removeListener(listener);
    },
    [shouldUpdateRef],
  );

  const state: T = useMutableSource(sharedState.source, getSnapshot, subscribe);

  // return the same function object between renderings
  const setSharedState = useCallback(
    (v: React.SetStateAction<T>) => {
      sharedState.setValue(v);
    },
    [sharedState],
  );

  return [state, setSharedState];
}
