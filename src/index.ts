import { App } from "vue";
import { Button, EventMap } from "./lib/addClickListener";
import vClickOutside from "./directive";
import { ClickOutsideTarget } from "./core";

interface ClickOutsideOption<T extends keyof EventMap> {
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
function defineClickOutsideOption<T extends keyof EventMap = "downUp">(
  option: ClickOutsideOption<T>
): ClickOutsideOption<T> {
  return option;
}

function install(app: App): void {
  app.directive("click-outside", vClickOutside);
}

export { onClickOutside } from "./hook";
export { defineVClickOutsideValue } from "./directive";
export type {
  VClickOutsideObjectValue,
  VClickOutsideFunctionValue,
} from "./directive";
export const clickOutside = vClickOutside;

export { defineClickOutsideOption };
export type { ClickOutsideOption };

export default {
  install,
};
