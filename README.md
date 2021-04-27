[![npm](https://img.shields.io/npm/v/@nekocode/use-shared-state)](https://www.npmjs.com/package/@nekocode/use-shared-state) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@nekocode/use-shared-state) [![](https://api.travis-ci.org/nekocode/use-shared-state.svg?branch=master)](https://travis-ci.org/nekocode/use-shared-state)

:octopus: React hook for sharing state between components. Inspired by the [InheritedWidget](https://api.flutter.dev/flutter/widgets/InheritedWidget-class.html) in flutter.

`yarn add @nekocode/use-shared-state`

***Why choose it?***

1. It's lightweight, includes just over a 100 lines of source code, so it's very suitable to use in component or library projects
2. Update components in minimum range. Using the example below, if we share a shared-state with b and e components, then when this shared-state updates, only b and e components will be updated
```
  a
+-+-+
| | |
b c d
    |
    e
```

Live example:

[![Edit useSharedState - example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/mystifying-cray-x2gcp?fontsize=14&hidenavigation=1&theme=dark)

## Usage

### 1. Share state between components

Simplest usage:

```tsx
const CounterContext = React.createContext(new SharedState(0));

const ComponentA = () => {
  const sharedState = React.useContext(CounterContext);
  const [state, setState] = useSharedState(sharedState);
  return (
    <div>
      <div>state: {state}</div>
      <button onClick={() => setState(state + 1)}>increase</button>
    </div>
  );
};

const ComponentB = () => {
  const sharedState = React.useContext(CounterContext);
  const [state] = useSharedState(sharedState);
  return <div>state: {state}</div>;
};

const App = () => {
  return (
    <CounterContext.Provider value={new SharedState(0)}>
      <ComponentA />
      <ComponentB />
    </CounterContext.Provider>
  );
}
```

Advanced:

```tsx
// Only get current state, will never update current component
// (the second argument is like the shouldComponentUpdate)
const [state, setState] = useSharedState(sharedState, false);

// Will update current component only when the value of state is bigger than 1
const [state] = useSharedState(sharedState, (current) => current > 1);

// Will update current component when the value of state changes
const [state] = useSharedState(sharedState, (current, prev) => current !== prev);
```

### 2. Notify event between components

Use `ChangeNotifier`, `ValueNotifier` & `useListen` to notify another component to invoke some callbacks (please note that, unlike the `useSharedState`, `useListen` will not trigger the re-render of hooked component):

```tsx
const refetchNotifier = new ChangeNotifier();
const eventNotifier = new ValueNotifier<string | null>(null);

const ComponentA = () => {
  // ...
  const changeListener = useCallback(() => {
    refetch();
  }, [refetch]);
  const valueListener = useCallback((value) => {
    if (value === 'setState') {
      setState();
    }
  }, [setState]);
  useListen(refetchNotifier, changeListener);
  useListen(eventNotifier, valueListener);
  // ...
};

// In component B, call notifyListeners/setValue to notify A to invoke callbacks
const ComponentB = () => {
  // ...
  refetchNotifier.notifyListeners();
  eventNotifier.setValue('setState');
  // ...
};
```

### 3. Create 'Controller' for controlling a component

Like [controllers in flutter](https://stackoverflow.com/a/53668245), we can also create a controller class for managing states of children component:

```tsx
export class AController {
  public title: SharedState<string>;
  public loading: SharedState<boolean>;

  constructor(initialTitle?: string, initialLoading?: boolean) {
    this.title = new SharedState<string>(initialTitle ?? '');
    this.loading = new SharedState<boolean>(initialLoading ?? false);
  }
}

export const A: React.FC<{ controller?: AController }> = ({ controller }) => {
  const ctrl = useMemo(() => controller ?? new AController(), [controller]);
  const [title] = useSharedState(ctrl.title);
  const [loading] = useSharedState(ctrl.loading);

  return (
    <Spin spinning={loading}>
      <div>{title}</div>
    </Spin>
  );
};
```
