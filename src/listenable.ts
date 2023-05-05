import { useCallback, useEffect, useRef } from 'react';

export type Listener<P extends Array<unknown>> = (...prarms: P) => void;

export abstract class Listenable<P extends Array<unknown>> {
  protected _listeners = Array<Listener<P>>();

  public hasListeners(): boolean {
    return this._listeners.length > 0;
  }

  public addListener(listener: Listener<P>): () => void {
    this._listeners.push(listener);
    return () => {
      this.removeListener(listener);
    };
  }

  public removeListener(listener: Listener<P>): void {
    const index = this._listeners.indexOf(listener);
    if (index > -1) {
      this._listeners.splice(index, 1);
    }
  }

  public notifyListeners(...params: P): void {
    if (!this.hasListeners()) return;
    for (const listener of this._listeners) {
      listener(...params);
    }
  }
}

export class ChangeNotifier extends Listenable<[]> {}

export class ValueNotifier<T> extends Listenable<[T, T]> {
  public constructor(protected value: T) {
    super();
  }

  public getValue(): T {
    return this.value;
  }

  public setValue(value: T | ((current: T) => T), notify = true): void {
    const previous = this.value;
    this.value = value instanceof Function ? value(this.value) : value;
    if (notify) {
      this.notifyListeners(this.value, previous);
    }
  }
}

export function useListen<P extends Array<unknown>>(
  listenable: Listenable<P> | undefined | null,
  listener: Listener<P>,
  afterListen?: () => void,
  afterUnlisten?: () => void,
): void {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;
  const afterListenRef = useRef(afterListen);
  afterListenRef.current = afterListen;
  const afterUnlistenRef = useRef(afterUnlisten);
  afterUnlistenRef.current = afterUnlisten;

  const consistentListener = useCallback(
    (...prarms: P) => {
      if (listenerRef.current) {
        listenerRef.current(...prarms);
      }
    },
    [listenerRef],
  );

  useEffect(() => {
    listenable?.addListener(consistentListener);
    if (afterListenRef.current) {
      afterListenRef.current();
    }
    return () => {
      listenable?.removeListener(consistentListener);
      if (afterUnlistenRef.current) {
        afterUnlistenRef.current();
      }
    };
  }, [listenable, consistentListener, afterListenRef, afterUnlistenRef]);
}
