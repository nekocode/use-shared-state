import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import ReactTestUtils from 'react-dom/test-utils';
import { SharedState, useSharedState } from '../index';

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

describe('useSharedState', () => {
  it('normal use', () => {
    const sharedState0 = new SharedState(0);
    const Context = React.createContext(sharedState0);

    const Component1 = () => {
      const sharedState = React.useContext(Context);
      const [state, setState] = useSharedState(sharedState);
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
      const [state, setState] = useSharedState(sharedState0, false);
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
        sharedState0,
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
      ReactDOM.createRoot(container).render(<App />);
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

  it('if shouldUpdate changes', () => {
    const sharedState0 = new SharedState(0);
    const Context = React.createContext(sharedState0);

    const Component1 = () => {
      const sharedState = React.useContext(Context);
      const shouldUpdate = useRef(true);
      const [state, setState] = useSharedState(
        sharedState,
        shouldUpdate.current,
      );
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
        sharedState0,
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
      ReactDOM.createRoot(container).render(<App />);
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

  it('set state in useEffect', () => {
    const sharedState0 = new SharedState(0);

    const Component1 = () => {
      const [state, setState] = useSharedState(sharedState0);
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
      return <Component1 />;
    };

    ReactTestUtils.act(() => {
      ReactDOM.createRoot(container).render(<App />);
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

  it('change state before all listeners have been added', () => {
    const sharedState0 = new SharedState(0);

    const Component1 = () => {
      const [state, setState] = useSharedState(sharedState0);
      useEffect(() => {
        setState((current) => current + 1);
      }, [setState]);

      return <div id="d1">{state}</div>;
    };

    const Component2 = () => {
      const [state] = useSharedState(sharedState0);
      return <div id="d2">{state}</div>;
    };

    const App = () => {
      return (
        <div>
          <Component1 />
          <Component2 />
        </div>
      );
    };

    ReactTestUtils.act(() => {
      ReactDOM.createRoot(container).render(<App />);
    });
    const div1 = container.querySelector('#d1');
    const div2 = container.querySelector('#d2');
    expect(sharedState0.getValue()).toBe(1);
    expect(div1.textContent).toBe('1');
    expect(div2.textContent).toBe('1');
  });

  it('pass null to the first parameter', () => {
    const sharedState0 = new SharedState<SharedState<number> | null>(null);

    const Component1 = () => {
      const [sharedState1] = useSharedState(sharedState0);
      const [state, setState] = useSharedState(sharedState1, true, 10);
      return (
        <>
          <button id="b1" onClick={() => setState((i) => ++i)} />
          <div id="d1">{state}</div>
        </>
      );
    };

    const Component2 = () => {
      const [, setState] = useSharedState(sharedState0);
      return (
        <button id="b2" onClick={() => setState(new SharedState<number>(0))} />
      );
    };

    const App = () => {
      return (
        <div>
          <Component1 />
          <Component2 />
        </div>
      );
    };

    ReactTestUtils.act(() => {
      ReactDOM.createRoot(container).render(<App />);
    });
    const button1 = container.querySelector('#b1');
    const button2 = container.querySelector('#b2');
    const div1 = container.querySelector('#d1');
    expect(sharedState0.getValue()).toBeNull();
    expect(div1.textContent).toBe('10');

    // Click button1
    ReactTestUtils.act(() => {
      button1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(sharedState0.getValue()).toBeNull();
    expect(div1.textContent).toBe('11');

    // Click button2
    ReactTestUtils.act(() => {
      button2.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(sharedState0.getValue()).not.toBeNull();
    expect(div1.textContent).toBe('0');

    // Click button1
    ReactTestUtils.act(() => {
      button1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(div1.textContent).toBe('1');
  });
});
