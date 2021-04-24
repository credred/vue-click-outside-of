import { ObjectDirective } from "vue";
import { ClickOutsideHandler, ClickOutsideOption } from ".";
import { createClickHandler } from "./core";

export interface VClickOutsideObjectValue extends ClickOutsideOption {
  handler: ClickOutsideHandler;
}

export type VClickOutsideFunctionValue = ClickOutsideOption &
  ClickOutsideHandler;

export type VClickOutsideValue =
  | VClickOutsideObjectValue
  | VClickOutsideFunctionValue;

// Type helper to make it easier to define directive value.
export function defineVClickOutsideValue<T extends VClickOutsideValue>(
  value: T
): T extends VClickOutsideFunctionValue
  ? VClickOutsideFunctionValue
  : VClickOutsideObjectValue {
  return value as never;
}

const removeClickListenerMap = new Map<Element, () => void>();

export interface VClickOutside {
  mounted: NonNullable<ObjectDirective<Element, VClickOutsideValue>["mounted"]>;
  updated: NonNullable<ObjectDirective<Element, VClickOutsideValue>["updated"]>;
  unmounted: NonNullable<
    ObjectDirective<Element, VClickOutsideValue>["unmounted"]
  >;
}

/**
 * @example
 * ```vue
 * <div v-click-outside></div>
 * ```
 */
const vClickOutside: VClickOutside = {
  mounted(el, { value }) {
    if (
      !value ||
      (typeof value !== "function" &&
        typeof (value as VClickOutsideObjectValue).handler !== "function")
    ) {
      throw new TypeError(
        "click-outside: Binding to the directive value must be a function or an object with handler method"
      );
    }
    const cb =
      typeof value === "function"
        ? value
        : (value as VClickOutsideObjectValue).handler;

    const removeClickListenerHandler = createClickHandler(el, cb, value);
    removeClickListenerMap.set(el, removeClickListenerHandler);
  },
  updated(el, { value }) {
    const cb =
      typeof value === "function"
        ? value
        : (value as VClickOutsideObjectValue).handler;

    let removeClickListenerHandler = removeClickListenerMap.get(el);
    removeClickListenerHandler?.();

    removeClickListenerHandler = createClickHandler(el, cb, value);
    removeClickListenerMap.set(el, removeClickListenerHandler);
  },
  unmounted(el) {
    // When el are unmounted all of the clickListener which register on it need to be removed.
    const removeClickListenerHandler = removeClickListenerMap.get(el);
    removeClickListenerHandler?.();
    removeClickListenerMap.delete(el);
  },
};

export default vClickOutside;
