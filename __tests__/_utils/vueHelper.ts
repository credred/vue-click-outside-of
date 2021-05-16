import { App, Component, createApp, VNode } from "vue";
import { clearAfter } from "./clearAfter";

interface HostElement extends Element {
  _vnode?: VNode;
}

export function mount(
  comp: Component,
  fn?: (app: App<HostElement>) => void
): App<HostElement> {
  const el = document.createElement("div");
  const app = createApp(comp) as App<HostElement>;
  fn?.(app);
  app.mount(el);
  document.body.append(el);
  clearAfter(() => {
    app.unmount();
    document.body.removeChild(el);
  });
  return app;
}
