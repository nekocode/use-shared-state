import React, { createContext, useContext, useState } from 'react';
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
    let notifyTimes = 0;
    const listener = () => {
      notifyTimes++;
    };
    const unListen = notifier.addListener(listener);
    notifier.notifyListeners();
    expect(notifyTimes).toBe(1);

    unListen();
    notifier.notifyListeners();
    expect(notifyTimes).toBe(1);

    notifier.addListener(listener);
    notifier.notifyListeners();
    expect(notifyTimes).toBe(2);

    notifier.removeListener(listener);
    notifier.notifyListeners();
    expect(notifyTimes).toBe(2);
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
    let notifyTimes = 0;
    const listener = (value: number) => {
      notifyTimes++;
      expect(value).toBe(0);
    };
    notifier.addListener(listener);
    notifier.setValue(0);
    expect(notifier.getValue()).toBe(0);
    expect(notifyTimes).toBe(1);

    notifier.setValue(1, false);
    expect(notifier.getValue()).toBe(1);
    expect(notifyTimes).toBe(1);

    notifier.removeListener(listener);
    notifier.setValue(2);
    expect(notifier.getValue()).toBe(2);
    expect(notifyTimes).toBe(1);
  });
});

describe('useListen', () => {
  it('normal using', () => {
    const notifier = new ValueNotifier(0);
    const Context = createContext(notifier);

    const Component1 = () => {
      const valueNotifier = useContext(Context);
      const [num, setNum] = useState(valueNotifier.getValue());
      useListen(valueNotifier, (current) => {
        setNum(current);
      });
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

    const Component1: React.FC<{ notifier?: ChangeNotifier }> = ({
      notifier,
    }) => {
      useListen(
        notifier,
        () => {
          valueNotifier.setValue((n) => ++n);
        },
        () => {
          valueNotifier.setValue((n) => ++n);
        },
        () => {
          valueNotifier.setValue(() => 0);
        },
      );
      return <div />;
    };

    const App = () => {
      const [destoried, setDestoried] = useState(false);
      const [notifier, setNotifier] = useState<ChangeNotifier | undefined>(
        changeNotifier,
      );
      const onClick1 = () => {
        setNotifier(undefined);
      };
      const onClick2 = () => {
        setDestoried(true);
      };
      return (
        <>
          {destoried ? <></> : <Component1 notifier={notifier} />}
          <button id="b1" onClick={onClick1} />
          <button id="b2" onClick={onClick2} />
        </>
      );
    };

    expect(valueNotifier.getValue()).toBe(0);

    ReactTestUtils.act(() => {
      ReactDOM.createRoot(container).render(<App />);
    });
    const button1 = container.querySelector('#b1');
    const button2 = container.querySelector('#b2');
    // After listener is added
    expect(valueNotifier.getValue()).toBe(1);

    // Notify listeners
    ReactTestUtils.act(() => {
      changeNotifier.notifyListeners();
    });
    expect(valueNotifier.getValue()).toBe(2);

    // Change notifier to undefined
    ReactTestUtils.act(() => {
      button1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(valueNotifier.getValue()).toBe(1);
    ReactTestUtils.act(() => {
      changeNotifier.notifyListeners();
    });
    expect(valueNotifier.getValue()).toBe(1);

    // Unmount component 1
    ReactTestUtils.act(() => {
      button2.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(valueNotifier.getValue()).toBe(0);
  });
});
