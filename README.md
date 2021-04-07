[![](https://api.travis-ci.org/nekocode/use-shared-state.svg?branch=master)](https://travis-ci.org/nekocode/use-shared-state) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@nekocode/use-shared-state)

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

`ChangeNotifier`, `ValueNotifier` & `useListen`:

```tsx
const refetchNotifier = new ChangeNotifier();
// In component A
const listener = useCallback(() => {
  refetch();
}, [refetch]);
useListen(refetchNotifier, listener);
// In component B, call notifyListeners() of refetchNotifier to let A run refetch()
refetchNotifier.notifyListeners();


const eventNotifier = new ValueNotifier<string | undefined>(undefined)
// In component A
const listener = useCallback(() => {
  if (eventNotifier.getValue() === 'refetch') {
    refetch();
  }
}, [eventNotifier, refetch]);
useListen(eventNotifier, listener);
// In component B, call setValue to let A run the callback
eventNotifier.setValue('refetch');
```
