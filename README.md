[![](https://api.travis-ci.org/nekocode/use-shared-state.svg?branch=master)](https://travis-ci.org/nekocode/use-shared-state) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@nekocode/use-shared-state)

:octopus: React hook for sharing state between components. Inspired by the [InheritedWidget](https://api.flutter.dev/flutter/widgets/InheritedWidget-class.html) in flutter.

`yarn add @nekocode/use-shared-state`

***Why choose it?***

1. It's lightweight, includes only less than 100 lines source code, so it's very suitable to use in component or library projects
2. Re-rendering components in minimum range. Using the example below, if we share a shared-state with b and e components, then when this shared-state updates, only b and e components will be re-rendered
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
const CounterContext = createSharedStateContext(new SharedState(0));

const ComponentA = () => {
  const counter = useSharedState<number>(CounterContext);
  const onClick = () => {
    counter.setValue(counter.getValue() + 1);
  };
  return (
    <div>
      <div>state: {counter.getValue()}</div>
      <button onClick={onClick}>increase</button>
    </div>
  );
};

const ComponentB = () => {
  const counter = useSharedState<number>(CounterContext);
  return <div>state: {counter.getValue()}</div>;
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
// Only get the shared state, will never re-render current component
const counter = useSharedState<number>(CounterContext, false);

// Will re-render current component only when the value of shared state is bigger than 1
const counter = useSharedState<number>(CounterContext, (current) => current > 1);

// Will re-render current component when the value of shared state changes
const counter = useSharedState<number>(CounterContext, (current, prev) => current !== prev);

// Hook a shared state instance directly
const sharedState = getSharedStateFromSomewhere();
const conuter = useSharedStateDirectly<number>(sharedState);
```
