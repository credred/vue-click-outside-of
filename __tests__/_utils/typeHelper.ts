import { Ref } from "@vue/reactivity";

export function assertRefNoUndefined<T>(
  ref: Ref<T | undefined>
): asserts ref is Ref<T> {
  if (ref.value === undefined) throw "ref value should not be undefined";
}

export function assertNoNullable<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined) throw "value should not be nullable";
}
