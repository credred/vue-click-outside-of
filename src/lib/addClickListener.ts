export interface EventMap {
  // mousedownEv was undefined if user already pressed mouse before register click outside handler
  downUp: (mousedownEv: MouseEvent | undefined, mouseupEv: MouseEvent) => void;
  click: (ev: MouseEvent) => void;
  dblclick: (ev: MouseEvent) => void;
}

type StopClickListener = () => void;

export function addClickListener<K extends keyof EventMap>(
  type: K,
  clickListener: EventMap[K]
): StopClickListener {
  let stopClickListener: (() => void) | undefined;
  if (type === "downUp") {
    let mousedownEv: MouseEvent;
    const mousedownHandler = (ev: MouseEvent) => void (mousedownEv = ev);
    const mouseupHandler = (mouseupEv: MouseEvent) => {
      clickListener(mousedownEv, mouseupEv);
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
  } else if (type === "click" || type === "dblclick") {
    function clickHandler(ev: MouseEvent) {
      (clickListener as EventMap[Exclude<K, "downUp">])(ev);
    }
    document.documentElement.addEventListener(
      type as Exclude<K, "downUp">,
      clickHandler
    );

    stopClickListener = () => {
      document.documentElement.removeEventListener(
        type as Exclude<K, "downUp">,
        clickHandler
      );
    };
  } else {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Unexpected click listen type: ${type}`);
  }

  return stopClickListener;
}
