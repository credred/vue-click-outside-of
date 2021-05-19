export interface EventMap {
  // mousedownEv was undefined if user already pressed mouse before register click outside handler
  downUp: (mousedownEv: MouseEvent | undefined, mouseupEv: MouseEvent) => void;
  click: (ev: MouseEvent) => void;
  dblclick: (ev: MouseEvent) => void;
}

export type Button = "left" | "right" | "all";

type StopClickListener = () => void;

export interface AddClickListenerOption<K extends keyof EventMap> {
  type: K;
  button: Button;
}

export function addClickListener<K extends keyof EventMap>(
  option: AddClickListenerOption<K>,
  clickListener: EventMap[K]
): StopClickListener {
  const { type, button } = option;
  let stopClickListener: (() => void) | undefined;

  if (type === "downUp") {
    let mousedownLeftEv: MouseEvent | undefined;
    let mousedownRightEv: MouseEvent | undefined;
    const mousedownHandler = (ev: MouseEvent) => {
      /* istanbul ignore else */
      if (ev.button === 0 && button !== "right") {
        mousedownLeftEv = ev;
      } else if (ev.button === 2 && button !== "left") {
        mousedownRightEv = ev;
      }
    };
    const mouseupHandler = (mouseupEv: MouseEvent) => {
      if (mouseupEv.button === 0 && button !== "right") {
        (clickListener as EventMap["downUp"])(mousedownLeftEv, mouseupEv);
        mousedownLeftEv = undefined;
      }
      if (mouseupEv.button === 2 && button !== "left") {
        (clickListener as EventMap["downUp"])(mousedownRightEv, mouseupEv);
        mousedownRightEv = undefined;
      }
    };

    document.documentElement.addEventListener("mousedown", mousedownHandler);
    document.documentElement.addEventListener("mouseup", mouseupHandler);

    stopClickListener = () => {
      document.documentElement.removeEventListener(
        "mousedown",
        mousedownHandler
      );
      document.documentElement.removeEventListener("mouseup", mouseupHandler);
    };
  } else if (type === "click") {
    function clickHandler(ev: MouseEvent) {
      (clickListener as EventMap["click"])(ev);
    }
    if (button !== "left") {
      document.documentElement.addEventListener("contextmenu", clickHandler);
    }
    if (button !== "right") {
      document.documentElement.addEventListener("click", clickHandler);
    }

    stopClickListener = () => {
      if (button !== "left") {
        document.documentElement.removeEventListener(
          "contextmenu",
          clickHandler
        );
      }
      if (button !== "right") {
        document.documentElement.removeEventListener("click", clickHandler);
      }
    };
  } else if (type === "dblclick") {
    function clickHandler(ev: MouseEvent) {
      (clickListener as EventMap["dblclick"])(ev);
    }
    document.documentElement.addEventListener("dblclick", clickHandler);

    stopClickListener = () => {
      document.documentElement.removeEventListener("dblclick", clickHandler);
    };
  } else {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Unexpected click listen type: ${type}`);
  }

  return stopClickListener;
}
