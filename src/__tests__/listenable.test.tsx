import React, { createContext, useContext, useState } from 'react';
import ReactDOM from 'react-dom';
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
  it('notifyListeners', () => {
    const changeNotifier = new ChangeNotifier();
    let flag = 0;
    const listener = () => {
      flag++;
    };
    changeNotifier.addListener(listener);
    changeNotifier.notifyListeners();
    expect(flag).toBe(1);

    changeNotifier.removeListener(listener);
    changeNotifier.notifyListeners();
    expect(flag).toBe(1);
  });
});

describe('ValueNotifier', () => {
  it('getAndSet', () => {
    const valueNotifier = new ValueNotifier(0);
    let flag = 0;
    const listener = () => {
      flag++;
    };
    valueNotifier.addListener(listener);
    valueNotifier.setValue(valueNotifier.getValue() + 1);
    expect(flag).toBe(1);
    expect(valueNotifier.getValue()).toBe(1);

    valueNotifier.removeListener(listener);
    valueNotifier.setValue(valueNotifier.getValue() + 1);
    expect(flag).toBe(1);
    expect(valueNotifier.getValue()).toBe(2);
  });
});

describe('useListen', () => {
  it('normalUsing', () => {
    const valueNotifier = new ValueNotifier(0);
    const Context = createContext(valueNotifier);

    const Component1 = () => {
      const valueNotifier = useContext(Context);
      const [value, setValue] = useState(valueNotifier.getValue());
      useListen(valueNotifier, () => {
        setValue(valueNotifier.getValue());
      });
      return <div id="d1">{value}</div>;
    };

    const Component2 = () => {
      const onClick = () => {
        valueNotifier.setValue(valueNotifier.getValue() + 1);
      };
      return (
        <button id="b1" onClick={onClick}>
          {valueNotifier.getValue()}
        </button>
      );
    };

    const App = () => {
      return (
        <Context.Provider value={valueNotifier}>
          <Component1 />
          <Component2 />
        </Context.Provider>
      );
    };

    ReactTestUtils.act(() => {
      ReactDOM.render(<App />, container);
    });
    const div1 = container.querySelector('#d1');
    const button1 = container.querySelector('#b1');
    expect(valueNotifier.getValue()).toBe(0);
    expect(div1.textContent).toBe('0');
    expect(button1.textContent).toBe('0');

    // Click button1
    ReactTestUtils.act(() => {
      button1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(valueNotifier.getValue()).toBe(1);
    expect(div1.textContent).toBe('1');
    expect(button1.textContent).toBe('0');
  });
});
