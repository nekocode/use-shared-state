[![](https://api.travis-ci.org/nekocode/use-shared-state.svg?branch=master)](https://travis-ci.org/nekocode/use-shared-state) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@nekocode/use-shared-state)

:octopus: React hook for sharing state between components. Inspired by the [provider](https://github.com/rrousselGit/provider) in flutter.

`yarn add @nekocode/use-shared-state`

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
// Only get the shared state, never re-render the component
const counter = useSharedState<number>(CounterContext, false);

// Re-render the component only when the new value of shared state is bigger than 1
const counter = useSharedState<number>(CounterContext, (current) => current > 1);

// Re-render the component only when the value of shared state changed
const counter = useSharedState<number>(CounterContext, (current, prev) => current !== prev);

// Use and hook a shared state directly
const sharedState = new SharedState(0);
const conuter = useSharedState<number>(sharedState);
```
