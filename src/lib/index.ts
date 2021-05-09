export * from "./componentHelper";

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const NOOP = (): void => {};

export function filterUndef<T>(arr: (T | undefined)[]): T[] {
  return arr.filter((item: T | undefined): item is T => item !== undefined);
}
