import React, { createContext, useCallback, useContext, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ReactTestUtils from 'react-dom/test-utils';
import { ChangeNotifier, useListen, ValueNotifier } from '../listenable';

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

describe('ChangeNotifier', () => {
  it('notify listeners', () => {
    const notifier = new ChangeNotifier();
    let flag = 0;
    const listener = () => {
      flag++;
    };
    const unListen = notifier.addListener(listener);
    notifier.notifyListeners();
    expect(flag).toBe(1);

    unListen();
    notifier.notifyListeners();
    expect(flag).toBe(1);

    notifier.addListener(listener);
    notifier.notifyListeners();
    expect(flag).toBe(2);

    notifier.removeListener(listener);
    notifier.notifyListeners();
    expect(flag).toBe(2);
  });
});

describe('ValueNotifier', () => {
  it('get & set value', () => {
    const notifier = new ValueNotifier(1);
    expect(notifier.getValue()).toBe(1);
    notifier.setValue(0);
    expect(notifier.getValue()).toBe(0);
    notifier.setValue((i) => i + 1);
    expect(notifier.getValue()).toBe(1);
  });

  it('listeners', () => {
    const notifier = new ValueNotifier(1);
    let flag = 0;
    const listener = (value: number) => {
      flag++;
      expect(value).toBe(0);
    };
    notifier.addListener(listener);
    notifier.setValue(0);
    expect(flag).toBe(1);

    notifier.removeListener(listener);
    notifier.setValue(1);
    expect(flag).toBe(1);
  });
});

describe('useListen', () => {
  it('normal using', () => {
    const notifier = new ValueNotifier(0);
    const Context = createContext(notifier);

    const Component1 = () => {
      const valueNotifier = useContext(Context);
      const [num, setNum] = useState(valueNotifier.getValue());
      useListen(
        valueNotifier,
        useCallback(
          (current) => {
            setNum(current);
          },
          [setNum],
        ),
      );
      return <div id="d1">{num}</div>;
    };

    const Component2 = () => {
      const onClick = () => {
        notifier.setValue((current) => current + 1);
      };
      return (
        <button id="b1" onClick={onClick}>
          {notifier.getValue()}
        </button>
      );
    };

    const App = () => {
      return (
        <Context.Provider value={notifier}>
          <Component1 />
          <Component2 />
        </Context.Provider>
      );
    };

    ReactTestUtils.act(() => {
      ReactDOM.createRoot(container).render(<App />);
    });
    const div1 = container.querySelector('#d1');
    const button1 = container.querySelector('#b1');
    expect(notifier.getValue()).toBe(0);
    expect(div1.textContent).toBe('0');
    expect(button1.textContent).toBe('0');

    // Click button1
    ReactTestUtils.act(() => {
      button1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(notifier.getValue()).toBe(1);
    expect(div1.textContent).toBe('1');
    expect(button1.textContent).toBe('0');
  });

  it('onListen', () => {
    const changeNotifier = new ChangeNotifier();
    const valueNotifier = new ValueNotifier(0);

    const Component1 = () => {
      useListen(
        changeNotifier,
        useCallback(() => {
          valueNotifier.setValue((n) => ++n);
        }, []),
        useCallback(() => {
          valueNotifier.setValue((n) => ++n);
          return () => {
            valueNotifier.setValue(() => 0);
          };
        }, []),
      );
      return <div />;
    };

    const App = () => {
      const [destoried, setDestoried] = useState(false);
      const onClick = () => {
        setDestoried(true);
      };
      return (
        <>
          {destoried ? <></> : <Component1 />}
          <button id="b1" onClick={onClick} />
        </>
      );
    };

    expect(valueNotifier.getValue()).toBe(0);

    ReactTestUtils.act(() => {
      ReactDOM.createRoot(container).render(<App />);
    });
    const button1 = container.querySelector('#b1');
    // After listener is added
    expect(valueNotifier.getValue()).toBe(1);

    // Notify listeners
    ReactTestUtils.act(() => {
      changeNotifier.notifyListeners();
    });
    expect(valueNotifier.getValue()).toBe(2);

    // Unmount component 1
    ReactTestUtils.act(() => {
      button1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(valueNotifier.getValue()).toBe(0);
  });
});
