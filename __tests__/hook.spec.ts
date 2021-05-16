import { onClickOutside } from "../src/index";
import {
  ComponentInternalInstance,
  defineComponent,
  getCurrentInstance,
  ref,
} from "@vue/runtime-core";
import { mount } from "./_utils/vueHelper";
import { listenClickOutside } from "../src/core";

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

describe(`${__NAME__} hook`, () => {
  describe("register/deregister event", () => {
    it("basic usage", () => {
      const elementRef = ref<HTMLElement>();
      const option = {};
      const App = defineComponent({
        template: `<div ref="elementRef"></div>`,
        setup() {
          onClickOutside(handler, elementRef, option);

          return { elementRef };
        },
      });
      mount(App);
      expect(listenClickOutside).toBeCalledWith(elementRef, handler, option);
    });

    it("without target", () => {
      let instance: ComponentInternalInstance | null = null;
      const option = {};
      const App = defineComponent({
        template: `<div></div>`,
        setup() {
          instance = getCurrentInstance();
          onClickOutside(handler, undefined, option);
        },
      });
      mount(App);
      expect(listenClickOutside).toBeCalledWith(instance, handler, option);
    });

    it("execution outside from vue lifecycle hook", () => {
      const el = document.createElement("div");
      onClickOutside(handler, el);

      expect(listenClickOutside).toBeCalledWith(el, handler, undefined);
    });

    it("target should not be undefined out of vue lifecycle hook", () => {
      expect(() => {
        onClickOutside(handler);
      }).toThrowError();
    });

    it("target stop the listener after componentInternalInstance unmounted", () => {
      const elementRef = ref<HTMLElement>();
      const option = {};
      const App = defineComponent({
        template: `<div ref="elementRef"></div>`,
        setup() {
          onClickOutside(handler, elementRef, option);

          return { elementRef };
        },
      });
      const app = mount(App);
      app.unmount();
      expect(stop).toBeCalled();
    });

    it("stop onClickOutside", () => {
      const elementRef = ref<HTMLElement>();
      const App = defineComponent({
        template: `<div ref="elementRef"></div>`,
        setup() {
          const stopHandler = onClickOutside(handler, elementRef);
          stopHandler();
          expect(stop).toBeCalled();
          return { elementRef };
        },
      });
      mount(App);
    });
  });
});
