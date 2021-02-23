import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { Listenable } from './change_notifier';

export type ValueListener<T> = (current: T, prev: T) => void;

export class SharedState<T> extends Listenable<ValueListener<T>> {
  public constructor(private value: T) {
    super();
  }

  public getValue(): T {
    return this.value;
  }

  public setValue(value: T | ((current: T) => T)): void {
    const prev = this.value;
    this.value = value instanceof Function ? value(this.value) : value;
    this.notifyListeners(this.value, prev);
  }

  public notifyListeners(current: T, prev: T): void {
    if (!this.hasListeners()) {
      return;
    }

    for (const listener of this._listeners) {
      listener(current, prev);
    }
  }
}

export function createSharedStateContext<T>(
  sharedState: SharedState<T>,
): React.Context<SharedState<T>> {
  return React.createContext(sharedState);
}

/**
 * Hook a shared state
 *
 * @param context Context of shared state to hook
 * @param shouldUpdate Boolean or function to decide whether to re-render current component when the value of the shared state changes
 */
export function useSharedState<T>(
  context: React.Context<SharedState<T>>,
  shouldUpdate: boolean | ((current: T, prev: T) => boolean) = true,
): [T, React.Dispatch<React.SetStateAction<T>>, SharedState<T>] {
  return useSharedStateDirectly(useContext(context), shouldUpdate);
}

/**
 * Hook a shared state
 *
 * @param sharedState Shared state to hook
 * @param shouldUpdate Boolean or function to decide whether to re-render current component when the value of the shared state changes
 */
export function useSharedStateDirectly<T>(
  sharedState: SharedState<T>,
  shouldUpdate: boolean | ((current: T, prev: T) => boolean) = true,
): [T, React.Dispatch<React.SetStateAction<T>>, SharedState<T>] {
  const updateState = useState<T>(sharedState.getValue())[1];
  const shouldUpdateRef = useRef<
    boolean | ((current: T, prev: T) => boolean)
  >();
  shouldUpdateRef.current = shouldUpdate;

  useEffect(() => {
    const listener = (current: T, prev: T) => {
      const l = shouldUpdateRef.current;
      if (l === false || (l instanceof Function && !l(current, prev))) {
        // If the `shouldUpdate` is or returns false, do not update state
        return;
      }

      updateState(current);
    };
    sharedState.addListener(listener);
    return () => {
      sharedState.removeListener(listener);
    };
  }, [sharedState, updateState]);

  const setSharedState = useCallback(
    (v: React.SetStateAction<T>) => {
      sharedState.setValue(v);
    },
    [sharedState],
  );

  return [sharedState.getValue(), setSharedState, sharedState];
}
