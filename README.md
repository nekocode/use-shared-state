[![npm](https://img.shields.io/npm/v/@nekocode/use-shared-state)](https://www.npmjs.com/package/@nekocode/use-shared-state) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@nekocode/use-shared-state) [![](https://api.travis-ci.com/nekocode/use-shared-state.svg?branch=master)](https://travis-ci.com/nekocode/use-shared-state)

:octopus: React hook for sharing state between components, inspired by the [InheritedWidget](https://api.flutter.dev/flutter/widgets/InheritedWidget-class.html) in Flutter.

`yarn add @nekocode/use-shared-state`

**_Why choose it?_**

1. It's lightweight and includes just over 100 lines of source code, making it very suitable for use in component or library projects
2. Update components within a minimum range. For example, if we share a shared-state with components b and e, only these components will be updated when the shared-state updates

```
  a
+-+-+
| | |
b c d
    |
    e
```

_相关文章: [use-shared-state 源码阅读](https://github.com/acfasj/blog/issues/3)_

Live demo:

[![Edit useSharedState - example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/mystifying-cray-x2gcp?fontsize=14&hidenavigation=1&theme=dark)

## Usage

### 1. Share state between components

The simplest usage:

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
};
```

Advanced usage:

```tsx
const sharedSate = useMemo(() => new SharedState(0), []);

// Only retrieve the current state value, the component will never be updated
const [state, setState] = useSharedState(sharedState, false);

// Update the component only when the current state value is greater than 1
const [state] = useSharedState(sharedState, (current, prev) => current > 1);

// Change the value of the shared state without updating hooked components
sharedState.setValue(1, false);

// When the first parameter (shared state) is null, use 1 as the initial state value
const [state] = useSharedState(null, true, 1);
```

### 2. Notify event between components

Use `ChangeNotifier`, `ValueNotifier`, and `useListen` to notify another component to invoke some callbacks. Please note that, unlike `useSharedState`, `useListen` will not trigger the re-rendering of the hooked component:

```tsx
const refetchNotifier = new ChangeNotifier();
const eventNotifier = new ValueNotifier<string | null>(null);

const ComponentA = () => {
  // ...
  useListen(refetchNotifier, () => refetch());
  useListen(eventNotifier, (value) => {
    if (value === 'setState') {
      setState();
    }
  });
  // ...
};

// In component B, call notifyListeners/setValue to notify A
const ComponentB = () => {
  // ...
  refetchNotifier.notifyListeners();
  eventNotifier.setValue('setState');
  // ...
};
```
