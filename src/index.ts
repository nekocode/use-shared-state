import React, { useContext, useState, useEffect, useRef } from 'react';

type ValueListener<T> = (value: T) => void;

export class SharedState<T> {
  private listeners = new Array<ValueListener<T>>();

  public constructor(private value: T) {}

  public getValue(): T {
    return this.value;
  }

  public setValue(value: T) {
    this.value = value;
    this.notifyListeners();
  }

  public addListener(listener: ValueListener<T>) {
    this.listeners.push(listener);
  }

  public removeListener(listener: ValueListener<T>) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  public notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.value);
    }
  }
}

type ISharedStateContext<T> = React.Context<SharedState<T>>;

export function createSharedStateContext<T>(
  sharedState: SharedState<T>,
): ISharedStateContext<T> {
  return React.createContext(sharedState);
}

/**
 * Hooks a shared state
 *
 * @param context Context of shared state to hook
 * @param listen Boolean or function to decide whether to re-render the component when the value of the shared state changes
 */
export function useSharedState<T>(
  context: ISharedStateContext<T>,
  listen: boolean | ((current: T, prev: T) => boolean) = true,
): SharedState<T> {
  return useSharedStateDirectly(useContext(context), listen);
}

/**
 * Hooks a shared state
 *
 * @param sharedState Shared state to hook
 * @param listen Boolean or function to decide whether to re-render the component when the value of the shared state changes
 */
export function useSharedStateDirectly<T>(
  sharedState: SharedState<T>,
  listen: boolean | ((current: T, prev: T) => boolean) = true,
): SharedState<T> {
  const updateState = useState(false)[1];
  const prevRef = useRef<T>(sharedState.getValue());
  const listenRef = useRef<boolean | ((current: T, prev: T) => boolean)>();
  listenRef.current = listen;

  useEffect(() => {
    const listener = (value: T) => {
      const l = listenRef.current;
      if (
        l === false ||
        (l instanceof Function && !l(value, prevRef.current))
      ) {
        // If the listen is or returns false, do not update state
        prevRef.current = value;
        return;
      }

      updateState(i => !i);
      prevRef.current = value;
    };
    sharedState.addListener(listener);
    return () => {
      sharedState.removeListener(listener);
    };
  }, []);

  return sharedState;
}
