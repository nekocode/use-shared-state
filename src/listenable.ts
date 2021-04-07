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

export class ChangeNotifier extends Listenable<() => void> {
  public notifyListeners(): void {
    if (!this.hasListeners()) {
      return;
    }

    for (const listener of this._listeners) {
      listener();
    }
  }
}

export class ValueNotifier<T> extends ChangeNotifier {
  public constructor(protected value: T) {
    super();
  }

  public getValue(): T {
    return this.value;
  }

  public setValue(value: T): void {
    this.value = value;
    this.notifyListeners();
  }
}

/**
 * Hook a callback to component
 *
 * @param listenable Listenable to hook
 * @param listener Bind the callback to listenable after component mounted and unbind it after component unmounted
 */
export function useListen<T extends Listenable<L>, L>(
  listenable: T,
  listener: L,
): void {
  useEffect(() => {
    listenable.addListener(listener);
    return () => {
      listenable.removeListener(listener);
    };
  }, [listenable, listener]);
}
