import { useState, useCallback, useMemo, useRef } from 'react';
import { ValueNotifier, useListen } from './listenable';
export * from './listenable';

export class SharedState<T> extends ValueNotifier<T> {}

/**
 * Get the value and setter of the shared state
 *
 * @param sharedState The target shared state
 * @param shouldUpdate Whether to update the component when the shared state changes
 * @param initialValue When the shared state parameter is null, return this initial state value
 */
export function useSharedState<T>(
  sharedState: SharedState<T>,
  shouldUpdate?: boolean | ((current: T, previous: T) => boolean),
): [T, (v: T | ((v: T) => T), notify?: boolean) => void];
export function useSharedState<T>(
  sharedState: SharedState<T> | undefined | null,
  shouldUpdate: boolean | ((current: T, previous: T) => boolean),
  initialValue: T,
): [T, (v: T | ((v: T) => T), notify?: boolean) => void];
export function useSharedState<T>(
  _sharedState: SharedState<T> | undefined | null,
  shouldUpdate: boolean | ((current: T, previous: T) => boolean) = true,
  initialValue?: T,
): [T, (v: T | ((v: T) => T), notify?: boolean) => void] {
  const initialValueRef = useRef(initialValue);
  const sharedState = useMemo(
    () => _sharedState ?? new SharedState(initialValueRef.current as T),
    [_sharedState],
  );
  const [state, setState] = useState<T>(sharedState.getValue());

  const listener = (current: T, previous: T) => {
    if (
      shouldUpdate === false ||
      (shouldUpdate instanceof Function && !shouldUpdate(current, previous))
    ) {
      // If 'shouldUpdate' is false or returns false, do not update the state
      return;
    }
    setState(current);
  };

  const afterListen = () => {
    // If the state changes before all listeners are added, notify the change after they have been added
    if (sharedState.getValue() !== state) {
      listener(sharedState.getValue(), state);
    }
  };
  useListen(sharedState, listener, afterListen);

  const setSharedState = useCallback<ValueNotifier<T>['setValue']>(
    (v, notify) => {
      sharedState.setValue(v, notify);
    },
    [sharedState],
  );

  return [sharedState.getValue(), setSharedState];
}
