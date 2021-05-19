import {
  ComponentInternalInstance,
  ComponentPublicInstance,
  Ref,
  unref,
  watchEffect,
} from "vue";
import {
  filterUndef,
  getRealTargetFromVNode,
  isComponentInternalInstance,
  isComponentPublicInstance,
} from "./lib";
import {
  addClickListener,
  AddClickListenerOption,
  Button,
  EventMap,
} from "./lib/addClickListener";

type ClickOutsideRawTarget = Element | ComponentPublicInstance;

export type ClickOutsideTarget =
  | ClickOutsideRawTarget
  | ClickOutsideRawTarget[]
  | Ref<ClickOutsideRawTarget | undefined>
  | Ref<ClickOutsideRawTarget | undefined>[]
  | ComponentInternalInstance;

export type ClickOutsideHandler<T extends keyof EventMap> = EventMap[T];

export interface ClickOutsideOption<T extends keyof EventMap> {
  /**
   * Indicates which event should trigger click outside handler.
   *
   * - downUp - *default* value. It was composed of mousedown event and mouseup event.
   *   click outside handler will not trigger as long as one of events target is internal element.
   * - click
   * - dblclick
   *
   * @default "all"
   */
  type?: T;
  /**
   * The click outside handler not executed when click target was contained with excluded element.
   *
   * You can use *middleware* option also to prevent executing click outside handler.
   */
  exclude?: ClickOutsideTarget;
  /**
   * The function will be executed before executing click outside handler.
   * it should return a boolean to decide click outside handler should be fire or not.
   *
   * You can use *exclude* option also if you want to exclude some element only.
   */
  before?: (...args: Parameters<EventMap[T]>) => boolean;
  /**
   * indicates which button was pressed on the mouse to trigger the click outside handler.
   * The option not support `dblclick` type.
   *
   * - "left"
   * - "right"
   * - "all" -  "default value".
   *
   * @default "all"
   */
  button?: Button;
  /**
   * @default document.documentElement
   */
  background?: HTMLElement | Document | Window | SVGElement;
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

export const outsideTargetSiblingMap = new WeakMap<Element, Element>();

/**
 * escape hatch for teleport element
 */
export function markSibling(outsideTarget: Element, sibling: Element): void {
  outsideTargetSiblingMap.set(outsideTarget, sibling);
}

export function unmarkSibling(outsideTarget: Element): void {
  outsideTargetSiblingMap.delete(outsideTarget);
}

function isOutside(targets: Element[], element: Element | null): boolean {
  const targetSet = new Set(targets);

  while (element) {
    const sibling = outsideTargetSiblingMap.get(element);
    if (
      targetSet.has(element) ||
      (sibling && targets.some((el) => el.contains(sibling)))
    ) {
      return false;
    }
    element = element.parentElement;
  }
  return true;
}

const defaultOption = {
  type: "downUp",
  button: "all",
  background: document.documentElement,
} as const;

export function listenClickOutside<T extends keyof EventMap = "downUp">(
  target: ClickOutsideTarget,
  cb: ClickOutsideHandler<T>,
  option: ClickOutsideOption<T> = {}
): () => void {
  return watchEffect((onInvalidate) => {
    const type = option.type || defaultOption.type;
    const addClickListenerOption: AddClickListenerOption<T> = {
      type: type as T,
      button: option.button || defaultOption.button,
      target: option.background || defaultOption.background,
    };

    const stop = addClickListener(
      addClickListenerOption,
      function clickListener(
        mousedownEvOrClickEv: MouseEvent | undefined,
        mouseupEv?: MouseEvent
      ) {
        const realTarget = getRealTarget(target);
        const excludeTarget = option.exclude
          ? getRealTarget(option.exclude)
          : [];
        if (realTarget.length === 0) {
          return;
        }
        const mousedownEvOrClickEvTargetOrNull = mousedownEvOrClickEv
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
          !isOutside(
            [...realTarget, ...excludeTarget],
            mousedownEvOrClickEvTargetOrNull
          ) ||
          !isOutside(
            [...realTarget, ...excludeTarget],
            mouseupEvTargetOrNull
          ) ||
          // the reason of disable @typescript-eslint/no-explicit-any:  ts can't recognize right typing
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (option.before && !option.before(...(cbArgs as any)))
        ) {
          return;
        }
        // the reason of using 'as' statement: ts can't recognize the right typing of cb paramter
        cb(...(cbArgs as [MouseEvent, MouseEvent]));
      }
    );

    onInvalidate(() => {
      stop();
    });
  });
}
