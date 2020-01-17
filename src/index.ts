import React, { useContext, useState, useEffect } from "react";

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
  initialValue: T
): ISharedStateContext<T> {
  return React.createContext(new SharedState(initialValue));
}

export function useSharedState<T>(
  context: ISharedStateContext<T>,
  listen: boolean = true
): SharedState<T> {
  const sharedState = useContext(context);
  const [_, setState] = useState<T>();

  useEffect(() => {
    if (listen === false) {
      return;
    }
    const listener = (value: T) => {
      setState(value);
    };
    sharedState.addListener(listener);
    return () => {
      sharedState.removeListener(listener);
    };
  });

  return sharedState;
}
