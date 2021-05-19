import { addClickListener } from "../../src/lib/addClickListener";
import { clearAfter } from "../_utils/clearAfter";

const originAddEventListener = document.documentElement.addEventListener.bind(
  document.documentElement
);
const addEventListener = jest
  .spyOn(document.documentElement, "addEventListener")
  .mockImplementation((...args) => {
    originAddEventListener(...args);
    // ensure every test suite has clear event listener
    clearAfter(() => document.documentElement.removeEventListener(...args));
  });
const removeEventListener = jest.spyOn(
  document.documentElement,
  "removeEventListener"
);
const handler = jest.fn();

afterEach(() => {
  handler.mockClear();
  // addEventListener mockImplementation register function which execute clearAfter method.
  // so removeEventListener.mockClear method execution should follow behind.
  clearAfter(() => {
    addEventListener.mockClear();
    removeEventListener.mockClear();
  });
});

describe(`${__NAME__} addEventListener`, () => {
  it("invalid type", () => {
    expect(() => {
      // @ts-expect-error test invalid type
      addClickListener({ type: "invalidType", button: "all" }, handler);
    }).toThrowError();
  });

  it("'downUp' type", () => {
    const stop = addClickListener({ type: "downUp", button: "all" }, handler);

    expect(addEventListener).toBeCalledTimes(2);
    expect(addEventListener).toBeCalledWith("mousedown", expect.any(Function));
    expect(addEventListener).toBeCalledWith("mouseup", expect.any(Function));

    stop();

    expect(removeEventListener).toBeCalledTimes(2);
    expect(removeEventListener).toBeCalledWith(
      "mousedown",
      expect.any(Function)
    );
    expect(removeEventListener).toBeCalledWith("mouseup", expect.any(Function));
  });

  it("'click' type and 'all' button", () => {
    const stop = addClickListener({ type: "click", button: "all" }, handler);

    expect(addEventListener).toBeCalledTimes(2);
    expect(addEventListener).toBeCalledWith(
      "contextmenu",
      expect.any(Function)
    );
    expect(addEventListener).toBeCalledWith("click", expect.any(Function));

    stop();

    expect(removeEventListener).toBeCalledTimes(2);
    expect(removeEventListener).toBeCalledWith(
      "contextmenu",
      expect.any(Function)
    );
    expect(removeEventListener).toBeCalledWith("click", expect.any(Function));
  });

  it("'click' type and 'left' button", () => {
    const stop = addClickListener({ type: "click", button: "left" }, handler);

    expect(addEventListener).toBeCalledTimes(1);
    expect(addEventListener).toBeCalledWith("click", expect.any(Function));

    stop();

    expect(removeEventListener).toBeCalledTimes(1);
    expect(removeEventListener).toBeCalledWith("click", expect.any(Function));
  });

  it("'click' type and 'right' button", () => {
    const stop = addClickListener({ type: "click", button: "right" }, handler);

    expect(addEventListener).toBeCalledTimes(1);
    expect(addEventListener).toBeCalledWith(
      "contextmenu",
      expect.any(Function)
    );

    stop();

    expect(removeEventListener).toBeCalledTimes(1);
    expect(removeEventListener).toBeCalledWith(
      "contextmenu",
      expect.any(Function)
    );
  });

  it("'dblclick' type", () => {
    const stop = addClickListener(
      { type: "dblclick", button: "left" },
      handler
    );

    expect(addEventListener).toBeCalledTimes(1);
    expect(addEventListener).toBeCalledWith("dblclick", expect.any(Function));

    stop();

    expect(removeEventListener).toBeCalledTimes(1);
    expect(removeEventListener).toBeCalledWith(
      "dblclick",
      expect.any(Function)
    );
  });

  it("should trigger handler properly if registration with 'downUp' type with 'left' button", () => {
    addClickListener({ type: "downUp", button: "all" }, handler);

    document.documentElement.dispatchEvent(
      new MouseEvent("mousedown", { button: 0 })
    );
    document.documentElement.dispatchEvent(
      new MouseEvent("mouseup", { button: 0 })
    );

    expect(handler).toBeCalledTimes(1);
  });

  it("should trigger handler properly if registration with 'downUp' type with 'right' button", () => {
    addClickListener({ type: "downUp", button: "all" }, handler);

    document.documentElement.dispatchEvent(
      new MouseEvent("mousedown", { button: 2 })
    );
    document.documentElement.dispatchEvent(
      new MouseEvent("mouseup", { button: 2 })
    );

    expect(handler).toBeCalledTimes(1);
  });

  it("should trigger handler properly if registration with 'downUp' type with 'all' button", () => {
    addClickListener({ type: "downUp", button: "all" }, handler);

    document.documentElement.dispatchEvent(
      new MouseEvent("mousedown", { button: 0 })
    );
    document.documentElement.dispatchEvent(
      new MouseEvent("mouseup", { button: 0 })
    );

    expect(handler).toBeCalledTimes(1);

    document.documentElement.dispatchEvent(
      new MouseEvent("mousedown", { button: 2 })
    );
    document.documentElement.dispatchEvent(
      new MouseEvent("mouseup", { button: 2 })
    );

    expect(handler).toBeCalledTimes(2);
  });

  it("should keep left mousedown event after right mousedown event triggered if registration with 'downUp' type with 'all' button", () => {
    addClickListener({ type: "downUp", button: "all" }, handler);

    const mousedownLeftEv = new MouseEvent("mousedown", { button: 0 });
    const mouseupLeftEv = new MouseEvent("mouseup", { button: 0 });
    const mousedownRightEv = new MouseEvent("mousedown", { button: 2 });
    const mouseupRightEv = new MouseEvent("mouseup", { button: 2 });

    document.documentElement.dispatchEvent(mousedownLeftEv);

    document.documentElement.dispatchEvent(mousedownRightEv);
    document.documentElement.dispatchEvent(mouseupRightEv);
    expect(handler).toBeCalledWith(mousedownRightEv, mouseupRightEv);

    document.documentElement.dispatchEvent(mouseupLeftEv);

    expect(handler).toBeCalledWith(mousedownLeftEv, mouseupLeftEv);
  });

  it("mousedown event may be undefined", () => {
    addClickListener({ type: "downUp", button: "all" }, handler);

    const mouseupEv = new MouseEvent("mouseup");

    document.documentElement.dispatchEvent(mouseupEv);

    expect(handler).toBeCalledWith(undefined, mouseupEv);
  });

  it("mousedown event should be lasted value", () => {
    addClickListener({ type: "downUp", button: "all" }, handler);

    const oldMousedownEv = new MouseEvent("mousedown");
    const oldMouseupEv = new MouseEvent("mouseup");

    document.documentElement.dispatchEvent(oldMousedownEv);
    document.documentElement.dispatchEvent(oldMouseupEv);

    const newMouseupEv = new MouseEvent("mouseup");
    document.documentElement.dispatchEvent(newMouseupEv);
    expect(handler).toBeCalledWith(undefined, newMouseupEv);
  });
});
