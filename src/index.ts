import React, { useContext, useState, useEffect, useRef } from "react";

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
  sharedState: SharedState<T>
): ISharedStateContext<T> {
  return React.createContext(sharedState);
}

/**
 * Accepts a context object and returns the shared state.
 *
 * @param listen Boolean or function to decide whether to re-render the component when the value of the shared state changes
 */
export function useSharedState<T>(
  context: ISharedStateContext<T>,
  listen: boolean | ((current: T, prev: T) => boolean) = true
): SharedState<T> {
  const sharedState = useContext(context);
  const [_, setState] = useState();
  const prevRef = useRef<T>(sharedState.getValue());

  useEffect(() => {
    if (listen === false) {
      // If the listen is false, don't add listeners to state
      return;
    }
    const listener = (value: T) => {
      if (listen instanceof Function && !listen(value, prevRef.current)) {
        // If the listen function returns false, don't setState
        prevRef.current = value;
        return;
      }

      setState(value);
      prevRef.current = value;
    };
    sharedState.addListener(listener);
    return () => {
      sharedState.removeListener(listener);
    };
  });

  return sharedState;
}
