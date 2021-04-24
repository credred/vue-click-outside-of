import { unref } from "vue";
import { ClickOutsideHandler, ClickOutsideOption } from ".";
import { addClickListener, EventMap } from "./lib/addClickListener";

function getInsideDOMs(inside: ClickOutsideOption["inside"]) {
  inside = unref(inside);
  if (!inside) return [];
  if (!Array.isArray(inside)) {
    inside = [inside];
  }
  return inside.filter(Boolean).map(unref) as Element[];
}

export function createClickHandler<T extends keyof EventMap = "downUp">(
  target: Element | Element[] | undefined,
  cb: ClickOutsideHandler<T>,
  option: ClickOutsideOption<T>
): ReturnType<typeof addClickListener> {
  const targetArr =
    (Array.isArray(target) && target) || (target && [target]) || [];

  return addClickListener(
    option.type || "downUp",
    function clickListener(
      mousedownEvOrClickEv: MouseEvent,
      mouseupEv?: MouseEvent
    ) {
      const mousedownEvTarget = mousedownEvOrClickEv.target as Element;
      const mouseupEvTarget =
        // the reason of disable no-non-null-assertion:  mouseupEv type must be MouseEvent if option.type is 'downUp'
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        option.type === "downUp" ? (mouseupEv!.target as Element) : null;
      const cbArgs =
        option.type === "downUp"
          ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ([mousedownEvOrClickEv, mouseupEv!] as const)
          : ([mousedownEvOrClickEv] as const);
      if (
        targetArr.some(
          (el) => el.contains(mousedownEvTarget) || el.contains(mouseupEvTarget)
        ) ||
        getInsideDOMs(option.inside).some(
          (insideDOM) =>
            insideDOM.contains(mousedownEvTarget) ||
            insideDOM.contains(mouseupEvTarget)
        ) ||
        // the reason of disable @typescript-eslint/no-explicit-any:  ts can't recognize right typing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (option.isOutside && !option.isOutside(...(cbArgs as any)))
      ) {
        return;
      }
      // the reason of using 'as' statement: ts can't recognize the right typing of cb paramter
      cb(...(cbArgs as [MouseEvent, MouseEvent]));
    }
  );
}
