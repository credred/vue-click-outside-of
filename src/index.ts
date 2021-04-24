import { App, Ref } from "vue";
import { EventMap } from "./lib/addClickListener";
import vClickOutside from "./directive";

export type ClickOutsideHandler<
  T extends keyof EventMap = "downUp"
> = EventMap[T];

export interface ClickOutsideOption<T extends keyof EventMap = "downUp"> {
  type?: T;
  /**
   * The handler of clickOutside will aren't called if click target belong to *inside* element when click event was fired on outside element.
   *
   * You can set some element as inside (like dropdown, modal, etc.).
   *
   * You can use *isOutside* option also if you need some logic to judge what element is inside.
   */
  inside?:
    | Element
    | Ref<Element | undefined>
    | (Element | Ref<Element | undefined>)[];
  /**
   * The callback will be called if the event was fired on outside element.
   *
   * @returns The handler of clickOutside will be called if true. It will be true if you aren't return any value.
   */
  isOutside?: (...args: Parameters<EventMap[T]>) => boolean | undefined;
}

function install(app: App): void {
  app.directive("click-outside", vClickOutside);
}

export { onClickOutside } from "./hook";
export const clickOutside = vClickOutside;

export default {
  install,
};
