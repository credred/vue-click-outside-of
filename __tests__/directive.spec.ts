import { defineVClickOutsideValue, ClickOutside } from "../src/index";
import { defineComponent, nextTick, Ref, ref } from "@vue/runtime-core";
import { mount } from "./_utils/vueHelper";
import { listenClickOutside } from "../src/core";
import { assertNoNullable } from "./_utils/typeHelper";
import { VClickOutsideObjectValue } from "../src/directive";

const handler = jest.fn();
const stop = jest.fn();

jest.mock("../src/core", () => {
  return {
    listenClickOutside: jest.fn().mockReturnValue(() => void stop()),
  };
});

beforeEach(() => {
  stop.mockClear();
  (listenClickOutside as ReturnType<typeof jest.fn>).mockClear();
});

describe(`${__NAME__} directive`, () => {
  it("binding value should be function or an object with handler method", () => {
    const App = defineComponent({
      directives: { ClickOutside },
      template: `<div v-click-outside="handler"></div>`,
      setup() {
        const handler = {};

        return { handler };
      },
    });
    const errorHandler = jest.fn();
    mount(App, (app) => {
      app.config.errorHandler = errorHandler;
    });
    expect(errorHandler).toBeCalled();
    // throw an error directly will crash other test suite. https://github.com/vuejs/vue-next/issues/3773
    // expect(() => {
    //   mount(App);
    // }).toThrowError();
  });

  it("binding value: VClickOutsideFunctionValue type", () => {
    const elementRef = ref<HTMLElement>();
    const option = {
      type: "click",
    } as const;
    const App = defineComponent({
      directives: { ClickOutside },
      template: `<div ref="elementRef" v-click-outside="value"></div>`,
      setup() {
        const value = defineVClickOutsideValue(handler, option);

        return { value, elementRef };
      },
    });

    mount(App);

    expect(listenClickOutside).toBeCalledWith(
      elementRef.value,
      handler,
      expect.objectContaining(option)
    );
  });

  it("binding value: VClickOutsideObjectValue type", () => {
    const elementRef = ref<HTMLElement>();
    const option = {
      type: "click",
    } as const;
    const App = defineComponent({
      directives: { ClickOutside },
      template: `<div ref="elementRef" v-click-outside="value"></div>`,
      setup() {
        const value = defineVClickOutsideValue({ handler, ...option });

        return { value, elementRef };
      },
    });

    mount(App);

    expect(listenClickOutside).toBeCalledWith(
      elementRef.value,
      handler,
      expect.objectContaining(option)
    );
  });

  it("should re-register if value change", async () => {
    expect(stop).not.toBeCalled();
    expect(listenClickOutside).not.toBeCalled();
    const elementRef = ref<HTMLElement>();
    const option = {
      type: "click",
    } as const;
    const value: Ref<VClickOutsideObjectValue<"click">> = ref(
      defineVClickOutsideValue({ handler, ...option })
    );
    const App = defineComponent({
      directives: { ClickOutside },
      template: `<div ref="elementRef" v-click-outside="value"></div>`,
      setup() {
        return { value, elementRef };
      },
    });

    const app = mount(App);
    handler.mockClear();
    (listenClickOutside as ReturnType<typeof jest.fn>).mockClear();
    assertNoNullable(app._container);
    assertNoNullable(app._container._vnode);
    assertNoNullable(app._container._vnode.component);

    value.value = defineVClickOutsideValue({ handler, ...option });

    await nextTick();

    expect(stop).toBeCalled();
    expect(listenClickOutside).toBeCalled();
  });

  it("should not re-register if value are not change", () => {
    expect(stop).not.toBeCalled();
    expect(listenClickOutside).not.toBeCalled();
    const elementRef = ref<HTMLElement>();
    const option = {
      type: "click",
    } as const;
    const App = defineComponent({
      directives: { ClickOutside },
      template: `<div ref="elementRef" v-click-outside="value"></div>`,
      setup() {
        const value = defineVClickOutsideValue({ handler, ...option });
        return { value, elementRef };
      },
    });

    const app = mount(App);
    handler.mockClear();
    (listenClickOutside as ReturnType<typeof jest.fn>).mockClear();
    assertNoNullable(app._container);
    assertNoNullable(app._container._vnode);
    assertNoNullable(app._container._vnode.component);
    app._container._vnode.component.update();

    expect(stop).not.toBeCalled();
    expect(listenClickOutside).not.toBeCalled();
  });
});
