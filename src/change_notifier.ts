export abstract class Listenable<T> {
  protected _listeners = Array<T>();

  public hasListeners(): boolean {
    return this._listeners.length > 0;
  }

  public addListener(listener: T): void {
    this._listeners.push(listener);
  }

  public removeListener(listener: T): void {
    const index = this._listeners.indexOf(listener);
    if (index > -1) {
      this._listeners.splice(index, 1);
    }
  }
}

export type VoidCallback = () => void;

export class ChangeNotifier extends Listenable<VoidCallback> {
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
