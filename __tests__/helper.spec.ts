import {
  ClickOutsideOption,
  defineVClickOutsideValue,
  VClickOutsideFunctionValue,
  VClickOutsideObjectValue,
  defineClickOutsideOption,
} from "../src";

describe("type helper", () => {
  describe("defineVClickOutsideValue helper", () => {
    it("should return directly if object type", () => {
      const rawValue: VClickOutsideObjectValue<"click"> = {
        type: "click",
        handler: jest.fn(),
      };
      const value = defineVClickOutsideValue(rawValue);

      expect(value).toBe(rawValue);
    });

    it("should append option to function if function type", () => {
      const rawValue: VClickOutsideFunctionValue<"click"> = jest.fn();
      const rawValueOption: ClickOutsideOption<"click"> = {
        type: "click",
        before: jest.fn(),
      };
      const value = defineVClickOutsideValue(rawValue, rawValueOption);

      expect(value).toEqual(rawValue);
      expect(value).toEqual(expect.objectContaining(rawValueOption));
    });
  });

  describe("defineClickOutsideOption helper", () => {
    it("should return option directly", () => {
      const rawOption: ClickOutsideOption<"click"> = {
        type: "click",
      };
      const option = defineClickOutsideOption(rawOption);

      expect(option).toBe(rawOption);
    });
  });
});
