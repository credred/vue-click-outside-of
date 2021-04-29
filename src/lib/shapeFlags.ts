/**
 * copy from https://github.com/vuejs/vue-next/master/packages/shared/src/shapeFlags.ts
 */
export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  ARRAY_CHILDREN = 1 << 4,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}
