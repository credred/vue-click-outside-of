import {
  addClickListener,
  AddClickListenerOption,
  EventMap,
} from "../../src/lib/addClickListener";
import { clearAfter } from "../_utils/clearAfter";

function createEventListener(target: HTMLElement | Document) {
  // use 'as' statement reason:
  // typescript can't recognize right type when we calling target.addEventListener("mousedown", ...)
  target = target as HTMLElement;
  const originAddEventListener = target.addEventListener.bind(target);
  const addEventListener = jest
    .spyOn(target, "addEventListener")
    .mockImplementation((...args) => {
      originAddEventListener(...args);
      // ensure every test suite has clear event listener
      clearAfter(() => target.removeEventListener(...args));
    });
  const removeEventListener = jest.spyOn(target, "removeEventListener");

  return { originAddEventListener, addEventListener, removeEventListener };
}

const { addEventListener, removeEventListener } = createEventListener(
  document.documentElement
);

const handler = jest.fn();

afterEach(() => {
  handler.mockClear();
  addEventListener.mockClear();
  removeEventListener.mockClear();
});

describe(`${__NAME__} addEventListener`, () => {
  function defineOption<T extends keyof EventMap = "downUp">(
    type: T,
    option: Partial<AddClickListenerOption<T>> = {}
  ): AddClickListenerOption<T> {
    return {
      type: type || "downUp",
      button: option.button || "all",
      target: option.target || document.documentElement,
      capture: option.capture || false,
    };
  }

  it("should add/remove event listener on target element", () => {
    const target = document.createElement("div");
    const { addEventListener, removeEventListener } =
      createEventListener(target);
    const stop = addClickListener(defineOption("downUp", { target }), handler);
    expect(addEventListener).toBeCalled();
    stop();
    expect(removeEventListener).toBeCalled();
  });

  it("capture option", () => {
    const stop = addClickListener(
      defineOption("click", { capture: true }),
      handler
    );
    expect(addEventListener).toBeCalledWith("click", expect.any(Function), {
      capture: true,
    });
    stop();
    expect(removeEventListener).toBeCalledWith("click", expect.any(Function), {
      capture: true,
    });
  });

  it("invalid type", () => {
    expect(() => {
      // @ts-expect-error test invalid type
      addClickListener(defineOption("invalidType"), handler);
    }).toThrowError();
  });

  it("'downUp' type", () => {
    const stop = addClickListener(defineOption("downUp"), handler);

    expect(addEventListener).toBeCalledTimes(2);
    expect(addEventListener).toBeCalledWith(
      "mousedown",
      expect.any(Function),
      expect.any(Object)
    );
    expect(addEventListener).toBeCalledWith(
      "mouseup",
      expect.any(Function),
      expect.any(Object)
    );

    stop();

    expect(removeEventListener).toBeCalledTimes(2);
    expect(removeEventListener).toBeCalledWith(
      "mousedown",
      expect.any(Function),
      expect.any(Object)
    );
    expect(removeEventListener).toBeCalledWith(
      "mouseup",
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("'click' type and 'all' button", () => {
    const stop = addClickListener(defineOption("click"), handler);

    expect(addEventListener).toBeCalledTimes(2);
    expect(addEventListener).toBeCalledWith(
      "contextmenu",
      expect.any(Function),
      expect.any(Object)
    );
    expect(addEventListener).toBeCalledWith(
      "click",
      expect.any(Function),
      expect.any(Object)
    );

    stop();

    expect(removeEventListener).toBeCalledTimes(2);
    expect(removeEventListener).toBeCalledWith(
      "contextmenu",
      expect.any(Function),
      expect.any(Object)
    );
    expect(removeEventListener).toBeCalledWith(
      "click",
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("'click' type and 'left' button", () => {
    const stop = addClickListener(
      defineOption("click", { button: "left" }),
      handler
    );

    expect(addEventListener).toBeCalledTimes(1);
    expect(addEventListener).toBeCalledWith(
      "click",
      expect.any(Function),
      expect.any(Object)
    );

    stop();

    expect(removeEventListener).toBeCalledTimes(1);
    expect(removeEventListener).toBeCalledWith(
      "click",
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("'click' type and 'right' button", () => {
    const stop = addClickListener(
      defineOption("click", { button: "right" }),
      handler
    );

    expect(addEventListener).toBeCalledTimes(1);
    expect(addEventListener).toBeCalledWith(
      "contextmenu",
      expect.any(Function),
      expect.any(Object)
    );

    stop();

    expect(removeEventListener).toBeCalledTimes(1);
    expect(removeEventListener).toBeCalledWith(
      "contextmenu",
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("'dblclick' type", () => {
    const stop = addClickListener(
      defineOption("dblclick", { button: "left" }),
      handler
    );

    expect(addEventListener).toBeCalledTimes(1);
    expect(addEventListener).toBeCalledWith(
      "dblclick",
      expect.any(Function),
      expect.any(Object)
    );

    stop();

    expect(removeEventListener).toBeCalledTimes(1);
    expect(removeEventListener).toBeCalledWith(
      "dblclick",
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("should trigger handler properly if registration with 'downUp' type with 'left' button", () => {
    addClickListener(defineOption("downUp"), handler);

    document.documentElement.dispatchEvent(
      new MouseEvent("mousedown", { button: 0 })
    );
    document.documentElement.dispatchEvent(
      new MouseEvent("mouseup", { button: 0 })
    );

    expect(handler).toBeCalledTimes(1);
  });

  it("should trigger handler properly if registration with 'downUp' type with 'right' button", () => {
    addClickListener(defineOption("downUp"), handler);

    document.documentElement.dispatchEvent(
      new MouseEvent("mousedown", { button: 2 })
    );
    document.documentElement.dispatchEvent(
      new MouseEvent("mouseup", { button: 2 })
    );

    expect(handler).toBeCalledTimes(1);
  });

  it("should trigger handler properly if registration with 'downUp' type with 'all' button", () => {
    addClickListener(defineOption("downUp"), handler);

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
    addClickListener(defineOption("downUp"), handler);

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
    addClickListener(defineOption("downUp"), handler);

    const mouseupEv = new MouseEvent("mouseup");

    document.documentElement.dispatchEvent(mouseupEv);

    expect(handler).toBeCalledWith(undefined, mouseupEv);
  });

  it("mousedown event should be lasted value", () => {
    addClickListener(defineOption("downUp"), handler);

    const oldMousedownEv = new MouseEvent("mousedown");
    const oldMouseupEv = new MouseEvent("mouseup");

    document.documentElement.dispatchEvent(oldMousedownEv);
    document.documentElement.dispatchEvent(oldMouseupEv);

    const newMouseupEv = new MouseEvent("mouseup");
    document.documentElement.dispatchEvent(newMouseupEv);
    expect(handler).toBeCalledWith(undefined, newMouseupEv);
  });
});
