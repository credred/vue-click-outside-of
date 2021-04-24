import {
  ComponentInternalInstance,
  ComponentPublicInstance,
  Fragment,
  getCurrentInstance,
  isVNode,
  Ref,
  unref,
  VNode,
  watchEffect,
} from "vue";
import { ClickOutsideHandler, ClickOutsideOption } from ".";
import { createClickHandler } from "./core";

type rawTarget =
  | Element
  | ComponentPublicInstance
  | (Element | ComponentPublicInstance)[]
  | undefined;
type refTarget = Ref<rawTarget>;
export type ClickOutsideHookTarget =
  | refTarget
  | rawTarget
  | ComponentInternalInstance;

function isComponentInternalInstance(
  instance: unknown
): instance is ComponentInternalInstance {
  return !!instance && isVNode((instance as ComponentInternalInstance).vnode);
}

function isComponentPublicInstance(
  instance: unknown
): instance is ComponentPublicInstance {
  return !!instance && isVNode((instance as ComponentPublicInstance).$.vnode);
}

function getRealTargetFromComponentInternalInstance(
  target: ComponentInternalInstance
): Element | Element[] {
  if (target.subTree.type === Fragment) {
    return (target.subTree.children as VNode[]).map(
      (vnode) => vnode.el as Element
    );
  } else {
    return target.subTree.el as Element;
  }
}

export type ClickOutsideStopHandler = () => void;

export function onClickOutside(
  handler: ClickOutsideHandler,
  target?: ClickOutsideHookTarget,
  option: ClickOutsideOption = {}
): ClickOutsideStopHandler {
  if (target === undefined) {
    const currentInstance = getCurrentInstance();
    if (currentInstance === null) {
      throw new TypeError(
        "onClickOutside hook is called when there is no active component instance to be associated with." +
          "It can only be used during execution of setup() When onClickOutside hook's 'target' argument are undefined"
      );
    }
    target = currentInstance;
  }
  const clickOutsideStopHandler = watchEffect(
    (onInvalidate) => {
      let newTarget = target;
      /** remove click listener handler */
      let removeClickListenerHandler: (() => void) | undefined = undefined;
      newTarget = unref(newTarget);
      if (newTarget === undefined) {
        newTarget = [];
      } else if (isComponentInternalInstance(newTarget)) {
        newTarget = getRealTargetFromComponentInternalInstance(newTarget);
      }
      if (!Array.isArray(newTarget)) {
        newTarget = [newTarget];
      }
      const realTarget = newTarget
        .map((t) =>
          isComponentPublicInstance(t)
            ? getRealTargetFromComponentInternalInstance(t.$)
            : t
        )
        .flat()
        .filter(Boolean);
      // if realTarget hasn't any Element, do nothing.
      if (realTarget.length === 0) {
        return;
      }

      removeClickListenerHandler = createClickHandler(
        realTarget,
        handler,
        option
      );

      onInvalidate(() => {
        removeClickListenerHandler?.();
      });
    },
    { flush: "post" }
  );

  return clickOutsideStopHandler;
}
