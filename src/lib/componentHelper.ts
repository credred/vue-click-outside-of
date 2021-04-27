import {
  ComponentInternalInstance,
  ComponentPublicInstance,
  isVNode,
  VNode,
} from "@vue/runtime-core";
import { ShapeFlags } from "./shapeFlags";
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

export function getRealTargetFromVNode(target: VNode): Element | Element[] {
  if (target.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    return (target.children as VNode[])
      .map((vnode) => getRealTargetFromVNode(vnode))
      .flat();
  } else if (target.shapeFlag & ShapeFlags.COMPONENT) {
    return getRealTargetFromVNode(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (target.component as ComponentInternalInstance).subTree
    );
  } else {
    return target.el as Element;
  }
}
