const { resolve } = require("path");
const vite = require("vite");
const packageJSON = require("../package.json");

/** @type {import("vite").UserConfig} */
const commonBuildConfig = {
  build: {
    lib: {
      entry: resolve(__dirname, "../src/index.ts"),
      name: packageJSON.name,
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
};

/** @type {import("vite").UserConfig} */
const buildConfigMin = {
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `${packageJSON.name}.min.[format].js`,
      },
    },
  },
};

/** @type {import("vite").UserConfig} */
const buildConfigNormal = {
  build: {
    minify: false,
  },
};

vite.build(vite.mergeConfig(commonBuildConfig, buildConfigMin));
vite.build(vite.mergeConfig(commonBuildConfig, buildConfigNormal));
