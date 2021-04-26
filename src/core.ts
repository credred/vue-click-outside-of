import {
  getRealTargetFromComponentInternalInstance,
  isComponentInternalInstance,
  isComponentPublicInstance,
  NOOP,
} from "./lib";
import {
  ComponentInternalInstance,
  ComponentPublicInstance,
  Ref,
  unref,
} from "vue";
import { ClickOutsideOption } from ".";
import { addClickListener, EventMap } from "./lib/addClickListener";

export type ClickOutsideHandler<
  T extends keyof EventMap = "downUp"
> = EventMap[T];

type ClickOutsideRawTarget =
  | Element
  | ComponentPublicInstance
  | (Element | ComponentPublicInstance)[];

export type ClickOutsideTarget =
  | ClickOutsideRawTarget
  | Ref<ClickOutsideRawTarget | undefined>
  | ComponentInternalInstance;

function getRealTarget(target: ClickOutsideTarget) {
  let newTarget:
    | ClickOutsideRawTarget
    | ComponentInternalInstance
    | undefined = unref(target);

  if (newTarget === undefined) {
    newTarget = [];
  } else if (isComponentInternalInstance(newTarget)) {
    newTarget = getRealTargetFromComponentInternalInstance(newTarget);
  }
  if (!Array.isArray(newTarget)) {
    newTarget = [newTarget];
  }
  return newTarget
    .map((t) =>
      isComponentPublicInstance(t)
        ? getRealTargetFromComponentInternalInstance(t.$)
        : t
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
