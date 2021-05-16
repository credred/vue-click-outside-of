import {
  ComponentPublicInstance,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  ref,
} from "@vue/runtime-core";
import {
  defineClickOutsideOption,
  listenClickOutside as originListenClickOutside,
} from "../src/core";
import { markSibling, unmarkSibling } from "../src/index";
import { mount } from "./_utils/vueHelper";
import { assertRefNoUndefined } from "./_utils/typeHelper";
import { clearAfter } from "./_utils/clearAfter";

const listenClickOutside: typeof originListenClickOutside = (...args) => {
  const stop = originListenClickOutside(...args);

  clearAfter(() => stop());

  return stop;
};

const handler = jest.fn();

beforeEach(() => {
  handler.mockClear();
});

describe(`${__NAME__} core`, () => {
  it("target: htmlElement", () => {
    const el = document.createElement("div");
    listenClickOutside(el, handler);

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

    expect(handler).toBeCalledTimes(1);
  });

  it("should return clear method", () => {
    const el = document.createElement("div");
    const stop = listenClickOutside(el, handler);

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

    expect(handler).toBeCalledTimes(1);

    stop();
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

    expect(handler).toBeCalledTimes(1);
  });

  it("target: ref with htmlElement value", () => {
    const el = document.createElement("div");
    listenClickOutside(ref(el), handler);

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

    expect(handler).toBeCalledTimes(1);
  });

  it("target: ref with ComponentPublicInstance value", () => {
    const childCompRef = ref<ComponentPublicInstance>();
    const childElementRef = ref<HTMLElement>();
    const childSubElementRef = ref<HTMLElement>();
    const Child = defineComponent({
      template: `
        <div ref="childElementRef">
          <div ref="childSubElementRef"></div>
        </div>`,
      setup() {
        return { childElementRef, childSubElementRef };
      },
    });
    const App = defineComponent({
      components: { Child },
      template: `
        <div>
          <Child ref="childCompRef"></Child>
        </div>`,
      setup() {
        listenClickOutside(childCompRef, handler, { type: "click" });
        return { childCompRef };
      },
    });

    mount(App);

    assertRefNoUndefined(childElementRef);
    assertRefNoUndefined(childSubElementRef);
    childElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    childSubElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).not.toBeCalled();

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toBeCalled();
  });

  it("target: ref with ComponentPublicInstance value which subTree may be change", async () => {
    const childCompRef = ref<ComponentPublicInstance>();
    const childElementRef = ref<HTMLElement>();
    const childSubElementRef = ref<HTMLElement>();

    const isShowChild = ref(false);

    const Child = defineComponent({
      template: `
        <div v-if="isShowChild" ref="childElementRef">
          <div ref="childSubElementRef"></div>
        </div>`,
      setup() {
        return { childElementRef, childSubElementRef, isShowChild };
      },
    });
    const App = defineComponent({
      components: { Child },
      template: `
        <div>
          <Child ref="childCompRef"></Child>
        </div>`,
      setup() {
        listenClickOutside(childCompRef, handler, { type: "click" });
        return { childCompRef };
      },
    });

    mount(App);

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toBeCalled();
    handler.mockClear();

    isShowChild.value = true;
    await nextTick();
    assertRefNoUndefined(childElementRef);
    assertRefNoUndefined(childSubElementRef);
    childElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    childSubElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).not.toBeCalled();
  });

  it("target: ref with ComponentPublicInstance which is Fragment component value", () => {
    const childCompRef = ref<ComponentPublicInstance>();
    const childElementRef1 = ref<HTMLElement>();
    const childElementRef2 = ref<HTMLElement>();
    const childSubElementRef1 = ref<HTMLElement>();
    const childSubElementRef2 = ref<HTMLElement>();
    const Child = defineComponent({
      template: `
        <div ref="childElementRef1">
          <div ref="childSubElementRef1"></div>
        </div>
        <div ref="childElementRef2">
          <div ref="childSubElementRef2"></div>
        </div>
      `,
      setup() {
        return {
          childElementRef1,
          childElementRef2,
          childSubElementRef1,
          childSubElementRef2,
        };
      },
    });
    const App = defineComponent({
      components: { Child },
      template: `
        <div>
          <Child ref="childCompRef"></Child>
        </div>`,
      setup() {
        listenClickOutside(childCompRef, handler, { type: "click" });
        return { childCompRef };
      },
    });

    mount(App);

    assertRefNoUndefined(childElementRef1);
    assertRefNoUndefined(childElementRef2);
    assertRefNoUndefined(childSubElementRef1);
    assertRefNoUndefined(childSubElementRef2);
    childElementRef1.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    childElementRef2.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    childSubElementRef1.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    childSubElementRef2.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).not.toBeCalled();

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toBeCalled();
  });

  it("target: ref with ComponentPublicInstance target which is nested Fragment component value", () => {
    const childCompRef = ref<ComponentPublicInstance>();
    const subChildElementRef1 = ref<HTMLElement>();
    const subChildSubElementRef1 = ref<HTMLElement>();

    const SubChild = defineComponent({
      template: `
        <div>
        </div>
        <div ref="subChildElementRef1">
          <div ref="subChildSubElementRef1"></div>
        </div>`,
      setup() {
        return { subChildElementRef1, subChildSubElementRef1 };
      },
    });

    const Child = defineComponent({
      components: { SubChild },
      template: `
        <div>
        </div>
        <SubChild></SubChild>
      `,
    });
    const App = defineComponent({
      components: { Child },
      template: `
        <div>
          <Child ref="childCompRef"></Child>
        </div>`,
      setup() {
        listenClickOutside(childCompRef, handler, { type: "click" });
        return { childCompRef };
      },
    });

    mount(App);

    assertRefNoUndefined(subChildElementRef1);
    assertRefNoUndefined(subChildSubElementRef1);
    subChildElementRef1.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    subChildSubElementRef1.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).not.toBeCalled();

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toBeCalled();
  });

  it("target: ref with ComponentPublicInstance and htmlElement target value", () => {
    const childCompRef = ref<ComponentPublicInstance>();
    const childElementRef = ref<HTMLElement>();
    const insideElementRef = ref<HTMLElement>();
    const outsideElementRef = ref<HTMLElement>();
    const Child = defineComponent({
      template: `
        <div ref="childElementRef"></div>`,
      setup() {
        return { childElementRef };
      },
    });
    const App = defineComponent({
      components: { Child },
      template: `
        <div>
          <Child ref="childCompRef"></Child>
          <div ref="insideElementRef"></div>
          <div ref="outsideElementRef"></div>
        </div>`,
      setup() {
        listenClickOutside([childCompRef, insideElementRef], handler, {
          type: "click",
        });
        return { childCompRef, insideElementRef, outsideElementRef };
      },
    });

    mount(App);

    assertRefNoUndefined(childCompRef);
    assertRefNoUndefined(childElementRef);
    assertRefNoUndefined(insideElementRef);
    assertRefNoUndefined(outsideElementRef);

    childElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    insideElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).not.toBeCalled();

    outsideElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).toBeCalled();
  });

  it("target: ref with ComponentInternalInstance which is Fragment component value", () => {
    const elementRef1 = ref<HTMLElement>();
    const elementRef2 = ref<HTMLElement>();
    const App = defineComponent({
      template: `
          <div ref="elementRef1"></div>
          <div ref="elementRef2"></div>
        `,
      setup() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const instance = getCurrentInstance()!;
        listenClickOutside(instance, handler, { type: "click" });

        return { elementRef1, elementRef2 };
      },
    });

    mount(App);

    assertRefNoUndefined(elementRef1);
    assertRefNoUndefined(elementRef2);
    elementRef1.value.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    elementRef2.value.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).not.toBeCalled();

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toBeCalled();
  });

  it("target: ref with ComponentInternalInstance value", () => {
    const childElement = ref<HTMLElement>();
    const App = defineComponent({
      template: `
        <div>
          <div ref="childElement"></div>
        </div>`,
      setup() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const instance = getCurrentInstance()!;
        listenClickOutside(instance, handler, { type: "click" });

        return { childElement };
      },
    });

    mount(App);

    assertRefNoUndefined(childElement);
    childElement.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).not.toBeCalled();

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toBeCalled();
  });

  it("exclude target", () => {
    const selfElementRef = ref<HTMLElement>();
    const excludeElementRef = ref<HTMLElement>();
    const outsideElementRef = ref<HTMLElement>();
    const App = defineComponent({
      template: `
        <div>
          <div ref="selfElementRef"></div>
          <div ref="excludeElementRef"></div>
          <div ref="outsideElementRef"></div>
        </div>`,
      setup() {
        listenClickOutside(selfElementRef, handler, {
          type: "click",
          exclude: excludeElementRef,
        });
        return { selfElementRef, excludeElementRef, outsideElementRef };
      },
    });

    mount(App);

    assertRefNoUndefined(selfElementRef);
    assertRefNoUndefined(excludeElementRef);
    assertRefNoUndefined(outsideElementRef);

    selfElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    excludeElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).not.toBeCalled();

    outsideElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).toBeCalled();
  });

  it("should not trigger handler if target is undefined", async () => {
    const isShowSelfElement = ref(false);
    const selfElementRef = ref<HTMLElement>();
    const outsideElementRef = ref<HTMLElement>();
    const App = defineComponent({
      template: `
        <div>
          <div v-if="isShowSelfElement" ref="selfElementRef"></div>
          <div ref="outsideElementRef"></div>
        </div>`,
      setup() {
        listenClickOutside(selfElementRef, handler, {
          type: "click",
        });
        return { isShowSelfElement, selfElementRef, outsideElementRef };
      },
    });

    mount(App);

    assertRefNoUndefined(outsideElementRef);

    outsideElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).not.toBeCalled();

    isShowSelfElement.value = true;
    await nextTick();

    assertRefNoUndefined(selfElementRef);

    outsideElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).toBeCalled();
  });

  it("should not execute handler if before callback exist and it return falsy", () => {
    const beforeCb = jest.fn();
    const selfElementRef = ref<HTMLElement>();
    const outsideElementRef = ref<HTMLElement>();
    const App = defineComponent({
      template: `
        <div>
          <div ref="selfElementRef"></div>
          <div ref="outsideElementRef"></div>
        </div>`,
      setup() {
        listenClickOutside(selfElementRef, handler, {
          type: "click",
          before: beforeCb,
        });
        return { selfElementRef, outsideElementRef };
      },
    });

    mount(App);

    assertRefNoUndefined(outsideElementRef);
    assertRefNoUndefined(selfElementRef);

    beforeCb.mockReturnValue(false);

    outsideElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(beforeCb).toBeCalled();
    expect(handler).not.toBeCalled();

    beforeCb.mockReturnValue(true);

    outsideElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).toBeCalled();
  });

  it("should reactive option", async () => {
    const option = reactive(
      defineClickOutsideOption({
        type: "click",
        button: "left",
      })
    );
    const stop = jest.fn();
    jest.mock("../src/lib/addClickListener.ts", () => {
      return {
        addClickListener: jest.fn().mockReturnValue(() => void stop()),
      };
    });
    const selfElementRef = ref<HTMLElement>();
    const outsideElementRef = ref<HTMLElement>();
    const App = defineComponent({
      template: `
        <div>
          <div ref="selfElementRef"></div>
          <div ref="outsideElementRef"></div>
        </div>`,
      setup() {
        listenClickOutside(selfElementRef, handler, option);
        return { selfElementRef, outsideElementRef };
      },
    });

    mount(App);

    assertRefNoUndefined(outsideElementRef);
    assertRefNoUndefined(selfElementRef);

    option.button = "right";
    await nextTick();
    outsideElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).not.toBeCalled();

    outsideElementRef.value.dispatchEvent(
      new MouseEvent("contextmenu", { bubbles: true })
    );
    expect(handler).toBeCalled();
  });

  it("escape hatch for teleport element(markSibling/unmarkSibling function)", () => {
    const selfElementRef = ref<HTMLElement>();
    const childElementRef = ref<HTMLElement>();
    const teleportElementRef = ref<HTMLElement>();
    const App = defineComponent({
      template: `
          <div>
            <div ref="selfElementRef">
              <div ref="childElementRef"></div>
              <teleport to="body">
                <div ref="teleportElementRef"></div>
              </teleport>
            </div>
          </div>`,
      setup() {
        listenClickOutside(selfElementRef, handler, {
          type: "click",
        });
        onMounted(() => {
          assertRefNoUndefined(childElementRef);
          assertRefNoUndefined(teleportElementRef);
          markSibling(teleportElementRef.value, childElementRef.value);
        });
        return {
          selfElementRef,
          childElementRef,
          teleportElementRef,
        };
      },
    });

    mount(App);

    assertRefNoUndefined(selfElementRef);
    assertRefNoUndefined(childElementRef);
    assertRefNoUndefined(teleportElementRef);

    teleportElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).not.toBeCalled();

    unmarkSibling(teleportElementRef.value);
    teleportElementRef.value.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    expect(handler).toBeCalled();
  });

  describe("handler and before callback should receive properly argument", () => {
    const before = jest.fn().mockReturnValue(true);
    beforeEach(() => {
      before.mockClear();
    });
    it("downUp type", () => {
      const el = document.createElement("div");
      listenClickOutside(el, handler, { before });
      const mousedownEv = new MouseEvent("mousedown", { bubbles: true });
      const mouseUpEv = new MouseEvent("mouseup", { bubbles: true });
      document.body.dispatchEvent(mousedownEv);
      document.body.dispatchEvent(mouseUpEv);

      expect(before).toBeCalledWith(mousedownEv, mouseUpEv);
      expect(handler).toBeCalledWith(mousedownEv, mouseUpEv);
    });
    it("downUp type and mousedown event may be undefined", () => {
      const el = document.createElement("div");
      listenClickOutside(el, handler, { before });
      const mouseUpEv = new MouseEvent("mouseup", { bubbles: true });
      document.body.dispatchEvent(mouseUpEv);

      expect(before).toBeCalledWith(undefined, mouseUpEv);
      expect(handler).toBeCalledWith(undefined, mouseUpEv);
    });
    it("click type", () => {
      const el = document.createElement("div");
      listenClickOutside(el, handler, { type: "click", before });
      const clickEv = new MouseEvent("click", { bubbles: true });
      document.body.dispatchEvent(clickEv);

      expect(before).toBeCalledWith(clickEv);
      expect(handler).toBeCalledWith(clickEv);

      const contextMenuEv = new MouseEvent("contextmenu", { bubbles: true });
      document.body.dispatchEvent(contextMenuEv);
      expect(before).toBeCalledWith(contextMenuEv);
      expect(handler).toBeCalledWith(contextMenuEv);
    });
    it("dblclick type", () => {
      const el = document.createElement("div");
      listenClickOutside(el, handler, { type: "dblclick", before });
      const dblclickEv = new MouseEvent("dblclick", { bubbles: true });
      document.body.dispatchEvent(dblclickEv);

      expect(before).toBeCalledWith(dblclickEv);
      expect(handler).toBeCalledWith(dblclickEv);
    });
  });
});
