import { getCurrentInstance, onUnmounted } from "vue";
import { EventMap } from "./lib/addClickListener";
import {
  ClickOutsideOption,
  ClickOutsideHandler,
  ClickOutsideTarget,
  listenClickOutside,
} from "./core";

export type ClickOutsideStopHandler = () => void;

export function onClickOutside<T extends keyof EventMap>(
  handler: ClickOutsideHandler<T>,
  target?: ClickOutsideTarget,
  option?: ClickOutsideOption<T>
): ClickOutsideStopHandler {
  const currentInstance = getCurrentInstance();
  let newTarget: ClickOutsideTarget;
  if (target === undefined) {
    if (currentInstance === null) {
      throw new TypeError(
        "onClickOutside hook is called when there is no active component instance to be associated with." +
          "It can only be used during execution of setup() when onClickOutside hook's 'target' argument are undefined"
      );
    }
    newTarget = currentInstance;
  } else {
    newTarget = target;
  }
  const stopClickOutsideListener = listenClickOutside(
    newTarget,
    handler,
    option
  );

  if (currentInstance) {
    onUnmounted(() => {
      stopClickOutsideListener();
    });
  }

  return stopClickOutsideListener;
}
