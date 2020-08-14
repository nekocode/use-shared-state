import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import {
  SharedState,
  createSharedStateContext,
  useSharedState,
  useSharedStateDirectly,
} from '..';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let container: HTMLElement | any;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

describe('SharedState', () => {
  it('getAndSet', () => {
    const sharedState = new SharedState(1);
    expect(sharedState.getValue()).toBe(1);
    sharedState.setValue(0);
    expect(sharedState.getValue()).toBe(0);
    sharedState.setValue((i) => i + 1);
    expect(sharedState.getValue()).toBe(1);
  });

  it('listeners', () => {
    const sharedState = new SharedState(1);
    let flag = 0;
    const listener = (value: number) => {
      flag++;
      expect(value).toBe(0);
    };
    sharedState.addListener(listener);
    sharedState.setValue(0);
    expect(flag).toBe(1);

    sharedState.removeListener(listener);
    sharedState.setValue(1);
    expect(flag).toBe(1);
  });
});

describe('useSharedState', () => {
  it('normalUsing', () => {
    const sharedState0 = new SharedState(0);
    const Context = createSharedStateContext(sharedState0);

    const Component1 = () => {
      const [state, setState] = useSharedState(Context);
      const onClick = () => {
        setState((current) => current + 1);
      };
      return (
        <button id="b1" onClick={onClick}>
          {state}
        </button>
      );
    };

    const Component2 = () => {
      const [state, setState] = useSharedStateDirectly(sharedState0, false);
      const onClick = () => {
        setState((current) => current + 1);
      };
      return (
        <button id="b2" onClick={onClick}>
          {state}
        </button>
      );
    };

    const Component3 = () => {
      const [state, setState] = useSharedState(
        Context,
        (current, prev) => current + prev === 3,
      );
      const onClick = () => {
        setState((current) => current + 1);
      };
      return (
        <button id="b3" onClick={onClick}>
          {state}
        </button>
      );
    };

    const App = () => {
      return (
        <Context.Provider value={sharedState0}>
          <Component1 />
          <Component2 />
          <Component3 />
        </Context.Provider>
      );
    };

    ReactTestUtils.act(() => {
      ReactDOM.render(<App />, container);
    });
    const button1 = container.querySelector('#b1');
    const button2 = container.querySelector('#b2');
    const button3 = container.querySelector('#b3');
    expect(sharedState0.getValue()).toBe(0);
    expect(button1.textContent).toBe('0');
    expect(button2.textContent).toBe('0');
    expect(button3.textContent).toBe('0');

    // Click button1
    ReactTestUtils.act(() => {
      button1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(sharedState0.getValue()).toBe(1);
    expect(button1.textContent).toBe('1');
    expect(button2.textContent).toBe('0');
    expect(button3.textContent).toBe('0');

    // Click button2
    ReactTestUtils.act(() => {
      button2.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(sharedState0.getValue()).toBe(2);
    expect(button1.textContent).toBe('2');
    expect(button2.textContent).toBe('0');
    expect(button3.textContent).toBe('2');

    // Click button3
    ReactTestUtils.act(() => {
      button3.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(sharedState0.getValue()).toBe(3);
    expect(button1.textContent).toBe('3');
    expect(button2.textContent).toBe('0');
    expect(button3.textContent).toBe('2');
  });

  it('on shouldUpdate changed', () => {
    const sharedState0 = new SharedState(0);
    const Context = createSharedStateContext(sharedState0);

    const Component1 = () => {
      const shouldUpdate = useRef(true);
      const [state, setState] = useSharedState(Context, shouldUpdate.current);
      const onClick = () => {
        shouldUpdate.current = !shouldUpdate.current;
        setState((current) => current + 1);
      };
      return (
        <button id="b1" onClick={onClick}>
          {state}
        </button>
      );
    };

    const Component2 = () => {
      const shouldUpdate = useRef(true);
      const [state, setState] = useSharedState(
        Context,
        () => shouldUpdate.current,
      );
      const onClick = () => {
        shouldUpdate.current = false;
        setState((current) => current + 1);
      };
      return (
        <button id="b2" onClick={onClick}>
          {state}
        </button>
      );
    };

    const App = () => {
      return (
        <Context.Provider value={sharedState0}>
          <Component1 />
          <Component2 />
        </Context.Provider>
      );
    };

    ReactTestUtils.act(() => {
      ReactDOM.render(<App />, container);
    });
    const button1 = container.querySelector('#b1');
    const button2 = container.querySelector('#b2');
    expect(sharedState0.getValue()).toBe(0);
    expect(button1.textContent).toBe('0');
    expect(button2.textContent).toBe('0');

    // Click button1
    ReactTestUtils.act(() => {
      button1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(sharedState0.getValue()).toBe(1);
    expect(button1.textContent).toBe('1');
    expect(button2.textContent).toBe('1');

    // Click button2
    ReactTestUtils.act(() => {
      button2.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(sharedState0.getValue()).toBe(2);
    expect(button1.textContent).toBe('1');
    expect(button2.textContent).toBe('1');

    // Click button2
    ReactTestUtils.act(() => {
      button2.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(sharedState0.getValue()).toBe(3);
    expect(button1.textContent).toBe('1');
    expect(button2.textContent).toBe('1');
  });

  it('updating in useEffect', () => {
    const sharedState0 = new SharedState(0);
    const Context = createSharedStateContext(sharedState0);

    const Component1 = () => {
      const [state, setState] = useSharedState(Context);
      useEffect(() => {
        setState((current) => current + 1);
      }, [setState]);

      const onClick = () => {
        setState((current) => current + 1);
      };
      return (
        <button id="b1" onClick={onClick}>
          {state}
        </button>
      );
    };

    const App = () => {
      return (
        <Context.Provider value={sharedState0}>
          <Component1 />
        </Context.Provider>
      );
    };

    ReactTestUtils.act(() => {
      ReactDOM.render(<App />, container);
    });
    const button1 = container.querySelector('#b1');
    expect(sharedState0.getValue()).toBe(1);
    expect(button1.textContent).toBe('1');

    // Click button1
    ReactTestUtils.act(() => {
      button1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(sharedState0.getValue()).toBe(2);
    expect(button1.textContent).toBe('2');
  });
});
