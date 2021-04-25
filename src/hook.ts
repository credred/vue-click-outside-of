import { getCurrentInstance, watchEffect } from "vue";
import { ClickOutsideOption } from ".";
import {
  ClickOutsideHandler,
  ClickOutsideTarget,
  listenClickOutside,
} from "./core";

export type ClickOutsideStopHandler = () => void;

export function onClickOutside(
  handler: ClickOutsideHandler,
  target?: ClickOutsideTarget,
  option: ClickOutsideOption = {}
): ClickOutsideStopHandler {
  let newTarget: ClickOutsideTarget;
  if (target === undefined) {
    const currentInstance = getCurrentInstance();
    if (currentInstance === null) {
      throw new TypeError(
        "onClickOutside hook is called when there is no active component instance to be associated with." +
          "It can only be used during execution of setup() When onClickOutside hook's 'target' argument are undefined"
      );
    }
    newTarget = currentInstance;
  }
  const clickOutsideStopHandler = watchEffect(
    (onInvalidate) => {
      const stopClickOutsideListener = listenClickOutside(
        newTarget,
        handler,
        option
      );

      onInvalidate(() => {
        stopClickOutsideListener();
      });
    },
    { flush: "post" }
  );

  return clickOutsideStopHandler;
}
