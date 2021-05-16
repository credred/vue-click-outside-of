import { createApp } from "vue";
import ClickOutsidePlugin, { ClickOutside } from "../src/index";

describe(`${__NAME__} plugin`, () => {
  it("registration as global directive", () => {
    const app = createApp({});
    app.use(ClickOutsidePlugin);

    expect(app._context.directives).toMatchObject({
      ClickOutside,
    });
  });
});
