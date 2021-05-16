import { ObjectDirective } from "vue";
import { EventMap } from "./lib/addClickListener";
import {
  ClickOutsideOption,
  ClickOutsideHandler,
  listenClickOutside,
} from "./core";

export interface VClickOutsideObjectValue<K extends keyof EventMap>
  extends ClickOutsideOption<K> {
  handler: ClickOutsideHandler<K>;
}

export type VClickOutsideFunctionValue<
  K extends keyof EventMap
> = ClickOutsideOption<K> & ClickOutsideHandler<K>;

export type VClickOutsideValue<K extends keyof EventMap> =
  | VClickOutsideObjectValue<K>
  | VClickOutsideFunctionValue<K>;

// overload 1
export function defineVClickOutsideValue<T extends keyof EventMap = "downUp">(
  value: VClickOutsideObjectValue<T>
): VClickOutsideObjectValue<T>;
// overload 2
export function defineVClickOutsideValue<T extends keyof EventMap = "downUp">(
  value: VClickOutsideFunctionValue<T>,
  option?: ClickOutsideOption<T>
): VClickOutsideFunctionValue<T>;
// implementation
/** Type helper to make it easier to define directive value. */
export function defineVClickOutsideValue<T extends keyof EventMap>(
  value: VClickOutsideValue<T>,
  option?: ClickOutsideOption<T>
): VClickOutsideFunctionValue<T> | VClickOutsideObjectValue<T> {
  if (typeof value === "function") {
    Object.assign(value, option);
  }
  return value;
}

export interface VClickOutside<K extends keyof EventMap = "downUp"> {
  mounted: NonNullable<
    ObjectDirective<Element, VClickOutsideValue<K>>["mounted"]
  >;
  updated: NonNullable<
    ObjectDirective<Element, VClickOutsideValue<K>>["updated"]
  >;
  unmounted: NonNullable<
    ObjectDirective<Element, VClickOutsideValue<K>>["unmounted"]
  >;
}

const removeClickListenerMap = new WeakMap<Element, () => void>();

function startListen(el: Element, value: VClickOutsideValue<keyof EventMap>) {
  if (
    !value ||
    (typeof value !== "function" &&
      typeof (value as VClickOutsideObjectValue<keyof EventMap>).handler !==
        "function")
  ) {
    throw new TypeError(
      "click-outside: Binding to the directive value must be a function or an object with handler method"
    );
  }
  const cb =
    typeof value === "function"
      ? value
      : (value as VClickOutsideObjectValue<keyof EventMap>).handler;

  const stopClickOutsideListener = listenClickOutside(el, cb, value);
  removeClickListenerMap.set(el, stopClickOutsideListener);
}

function stopListen(el: Element) {
  const stopClickOutsideListener = removeClickListenerMap.get(el);
  stopClickOutsideListener?.();
  removeClickListenerMap.delete(el);
}

/**
 * @example
 * ```vue
 * <div v-click-outside></div>
 * ```
 */
const vClickOutside: VClickOutside<keyof EventMap> = {
  mounted(el, { value }) {
    startListen(el, value);
  },
  updated(el, { value, oldValue }) {
    if (value === oldValue) {
      return;
    }

    stopListen(el);

    startListen(el, value);
  },
  unmounted(el) {
    stopListen(el);
  },
};

export default vClickOutside;
