import { App } from "vue";
import vClickOutside from "./directive";

export default function install(app: App): void {
  app.directive("click-outside", vClickOutside);
}

export type { ClickOutsideOption } from "./core";
export { defineClickOutsideOption } from "./core";
export { onClickOutside } from "./hook";
export { defineVClickOutsideValue } from "./directive";
export type {
  VClickOutsideObjectValue,
  VClickOutsideFunctionValue,
} from "./directive";
export const clickOutside = vClickOutside;
