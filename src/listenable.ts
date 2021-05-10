import { useEffect } from 'react';

export abstract class Listenable<L> {
  protected _listeners = Array<L>();

  public hasListeners(): boolean {
    return this._listeners.length > 0;
  }

  public addListener(listener: L): void {
    this._listeners.push(listener);
  }

  public removeListener(listener: L): void {
    const index = this._listeners.indexOf(listener);
    if (index > -1) {
      this._listeners.splice(index, 1);
    }
  }
}

export type VoidListener = () => void;

export class ChangeNotifier extends Listenable<VoidListener> {
  public notifyListeners(): void {
    if (!this.hasListeners()) return;
    for (const listener of this._listeners) {
      listener();
    }
  }
}

export type ValueListener<T> = (current: T, prev: T) => void;

export class ValueNotifier<T> extends Listenable<ValueListener<T>> {
  public constructor(protected value: T) {
    super();
  }

  public getValue(): T {
    return this.value;
  }

  public setValue(value: T | ((current: T) => T)): void {
    const previous = this.value;
    this.value = value instanceof Function ? value(this.value) : value;
    this.notifyListeners(this.value, previous);
  }

  public notifyListeners(current: T, previous: T): void {
    if (!this.hasListeners()) return;
    for (const listener of this._listeners) {
      listener(current, previous);
    }
  }
}

/**
 * Hook a callback to component
 *
 * @param listenable Listenable to hook
 * @param listener Bind the callback to listenable after component mounted and unbind it after component unmounted
 */
export function useListen<L>(listenable: Listenable<L>, listener: L): void {
  useEffect(() => {
    listenable.addListener(listener);
    return () => {
      listenable.removeListener(listener);
    };
  }, [listenable, listener]);
}
