import {
  ComponentInternalInstance,
  ComponentPublicInstance,
  Fragment,
  isVNode,
  VNode,
} from "@vue/runtime-core";

export function isComponentInternalInstance(
  instance: unknown
): instance is ComponentInternalInstance {
  return !!instance && isVNode((instance as ComponentInternalInstance).vnode);
}

export function isComponentPublicInstance(
  instance: unknown
): instance is ComponentPublicInstance {
  return (
    !!instance &&
    isComponentInternalInstance((instance as ComponentPublicInstance).$)
  );
}

export function getRealTargetFromComponentInternalInstance(
  target: ComponentInternalInstance
): Element | Element[] {
  if (target.subTree.type === Fragment) {
    return (target.subTree.children as VNode[]).map(
      (vnode) => vnode.el as Element
    );
  } else {
    return target.subTree.el as Element;
  }
}
