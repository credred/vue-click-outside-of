import {
  ComponentInternalInstance,
  ComponentPublicInstance,
  Ref,
  unref,
} from "vue";
import {
  filterUndef,
  getRealTargetFromVNode,
  isComponentInternalInstance,
  isComponentPublicInstance,
  NOOP,
} from "./lib";
import { addClickListener, Button, EventMap } from "./lib/addClickListener";

type ClickOutsideRawTarget = Element | ComponentPublicInstance;

export type ClickOutsideTarget =
  | ClickOutsideRawTarget
  | ClickOutsideRawTarget[]
  | Ref<ClickOutsideRawTarget | undefined>
  | Ref<ClickOutsideRawTarget | undefined>[]
  | ComponentInternalInstance;

export type ClickOutsideHandler<T extends keyof EventMap> = EventMap[T];

export interface ClickOutsideOption<T extends keyof EventMap> {
  type?: T;
  /**
   * The click outside handler not executed when click target was contained with excluded element.
   *
   * You can use *middleware* option also to prevent executing click outside handler.
   */
  exclude?: ClickOutsideTarget;
  /**
   * The function will be executed before executing click outside handler and
   * it should return a boolean if click outside handler should be fire or not.
   *
   * You can use *exclude* option also if you want to exclude some element only.
   */
  before?: (...args: Parameters<EventMap[T]>) => boolean;
  /**
   * indicates which button was pressed on the mouse to trigger the click outside handler
   *
   * not support "dblclick" type
   * @default "all"
   */
  button?: Button;
}

/**
 * Type helper to make it easier to define clickOutside option.
 */
export function defineClickOutsideOption<T extends keyof EventMap = "downUp">(
  option: ClickOutsideOption<T>
): ClickOutsideOption<T> {
  return option;
}

type ArrayItem<T extends Array<unknown>> = T extends Array<infer R> ? R : never;
function getRealTarget(target: ClickOutsideTarget): Element[] {
  let newTarget = Array.isArray(target)
    ? // the reason of using ArrayItem genetic:  typescript can't recognize 't' type
      target.map((t: ArrayItem<typeof target>) => unref(t))
    : unref(target);

  if (newTarget === undefined) {
    return [];
  } else if (isComponentInternalInstance(newTarget)) {
    const realTarget = getRealTargetFromVNode(newTarget.subTree);
    return Array.isArray(realTarget) ? realTarget : [realTarget];
  }
  if (!Array.isArray(newTarget)) {
    newTarget = [newTarget];
  }
  return filterUndef(newTarget)
    .map((t) =>
      isComponentPublicInstance(t) ? getRealTargetFromVNode(t.$.subTree) : t
    )
    .flat();
}

export function listenClickOutside<T extends keyof EventMap = "downUp">(
  target: ClickOutsideTarget,
  cb: ClickOutsideHandler<T>,
  option: ClickOutsideOption<T>
): () => void {
  const type = option.type || "downUp";
  const button = option.button || "all";
  const realTarget = getRealTarget(target);
  const excludeTarget = option.exclude ? getRealTarget(option.exclude) : [];
  if (realTarget.length === 0) {
    return NOOP;
  }

  return addClickListener(
    type || "downUp",
    function clickListener(
      mousedownEvOrClickEv: MouseEvent | undefined,
      mouseupEv?: MouseEvent
    ) {
      const mousedownEvOrClickTarget = mousedownEvOrClickEv
        ? (mousedownEvOrClickEv.target as Element)
        : null;
      const mouseupEvTargetOrNull =
        // the reason of disable no-non-null-assertion:  mouseupEv type must be MouseEvent if type is 'downUp'
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        type === "downUp" ? (mouseupEv!.target as Element) : null;
      const cbArgs =
        type === "downUp"
          ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ([mousedownEvOrClickEv, mouseupEv!] as const)
          : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ([mousedownEvOrClickEv!] as const);
      if (
        [...realTarget, ...excludeTarget].some(
          (el) =>
            el.contains(mousedownEvOrClickTarget) ||
            el.contains(mouseupEvTargetOrNull)
        ) ||
        // the reason of disable @typescript-eslint/no-explicit-any:  ts can't recognize right typing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (option.before && !option.before(...(cbArgs as any)))
      ) {
        return;
      }
      // the reason of using 'as' statement: ts can't recognize the right typing of cb paramter
      cb(...(cbArgs as [MouseEvent, MouseEvent]));
    },
    button
  );
}
