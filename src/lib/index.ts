export * from "./componentHelper";

export function filterUndef<T>(arr: (T | undefined)[]): T[] {
  return arr.filter((item: T | undefined): item is T => item !== undefined);
}
