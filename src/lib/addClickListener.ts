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
  target: HTMLElement | Document | Window | SVGElement;
}

export function addClickListener<K extends keyof EventMap>(
  option: AddClickListenerOption<K>,
  clickListener: EventMap[K]
): StopClickListener {
  const { type, button } = option;
  // use 'as' statement reason:
  // typescript can't recognize right type when we calling target.addEventListener("mousedown", ...)
  const target = option.target as HTMLElement;
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

    target.addEventListener("mousedown", mousedownHandler);
    target.addEventListener("mouseup", mouseupHandler);

    stopClickListener = () => {
      target.removeEventListener("mousedown", mousedownHandler);
      target.removeEventListener("mouseup", mouseupHandler);
    };
  } else if (type === "click") {
    function clickHandler(ev: MouseEvent) {
      (clickListener as EventMap["click"])(ev);
    }
    if (button !== "left") {
      target.addEventListener("contextmenu", clickHandler);
    }
    if (button !== "right") {
      target.addEventListener("click", clickHandler);
    }

    stopClickListener = () => {
      if (button !== "left") {
        target.removeEventListener("contextmenu", clickHandler);
      }
      if (button !== "right") {
        target.removeEventListener("click", clickHandler);
      }
    };
  } else if (type === "dblclick") {
    function clickHandler(ev: MouseEvent) {
      (clickListener as EventMap["dblclick"])(ev);
    }
    target.addEventListener("dblclick", clickHandler);

    stopClickListener = () => {
      target.removeEventListener("dblclick", clickHandler);
    };
  } else {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Unexpected click listen type: ${type}`);
  }

  return stopClickListener;
}
