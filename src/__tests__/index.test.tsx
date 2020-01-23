import React from "react";
import ReactDOM from "react-dom";
import ReactTestUtils from "react-dom/test-utils";
import { SharedState, createSharedStateContext, useSharedState } from "..";

let container: HTMLElement | any;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

describe("SharedState", () => {
  it("getAndSet", () => {
    const sharedState = new SharedState(1);
    expect(sharedState.getValue()).toBe(1);
    sharedState.setValue(0);
    expect(sharedState.getValue()).toBe(0);
  });

  it("listeners", () => {
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

describe("useSharedState", () => {
  it("works", () => {
    const Context = createSharedStateContext(new SharedState(0));

    const Component1 = () => {
      const sharedState = useSharedState(Context);
      const onClick = () => {
        sharedState.setValue(sharedState.getValue() + 1);
      };
      return (
        <button id="b1" onClick={onClick}>
          {sharedState.getValue()}
        </button>
      );
    };

    const Component2 = () => {
      const sharedState = useSharedState(Context, false);
      const onClick = () => {
        sharedState.setValue(sharedState.getValue() + 1);
      };
      return (
        <button id="b2" onClick={onClick}>
          {sharedState.getValue()}
        </button>
      );
    };

    const Component3 = () => {
      const sharedState = useSharedState(Context, (value) => value > 2);
      const onClick = () => {
        sharedState.setValue(sharedState.getValue() + 1);
      };
      return (
        <button id="b3" onClick={onClick}>
          {sharedState.getValue()}
        </button>
      );
    };

    const App = () => {
      return (
        <Context.Provider value={new SharedState(0)}>
          <Component1 />
          <Component2 />
          <Component3 />
        </Context.Provider>
      );
    };

    ReactTestUtils.act(() => {
      ReactDOM.render(<App />, container);
    });
    const button1 = container.querySelector("#b1");
    const button2 = container.querySelector("#b2");
    const button3 = container.querySelector("#b3");
    expect(button1.textContent).toBe("0");
    expect(button2.textContent).toBe("0");
    expect(button3.textContent).toBe("0");

    // Click button1
    ReactTestUtils.act(() => {
      button1.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(button1.textContent).toBe("1");
    expect(button2.textContent).toBe("0");
    expect(button3.textContent).toBe("0");

    // Click button2
    ReactTestUtils.act(() => {
      button2.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(button1.textContent).toBe("2");
    expect(button2.textContent).toBe("0");
    expect(button3.textContent).toBe("0");

    // Click button3
    ReactTestUtils.act(() => {
      button3.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(button1.textContent).toBe("3");
    expect(button2.textContent).toBe("0");
    expect(button3.textContent).toBe("3");
  });
});
