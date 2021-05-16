import { App } from "vue";
import vClickOutside from "./directive";

export default function install(app: App): void {
  app.directive("ClickOutside", vClickOutside);
}

export type { ClickOutsideOption } from "./core";
export { defineClickOutsideOption, markSibling, unmarkSibling } from "./core";
export { onClickOutside } from "./hook";
export { defineVClickOutsideValue } from "./directive";
export type {
  VClickOutsideObjectValue,
  VClickOutsideFunctionValue,
} from "./directive";
export const ClickOutside = vClickOutside;
