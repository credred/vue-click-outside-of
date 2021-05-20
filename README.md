<h1 align="center">vue-click-outside-of</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/vue-click-outside-of">
    <img src="https://img.shields.io/npm/v/vue-click-outside-of"/>
  </a>
  <a href="https://codecov.io/gh/credred/vue-click-outside-of">
    <img src="https://codecov.io/gh/credred/vue-click-outside-of/branch/main/graph/badge.svg?token=RS2YDY8FUT"/>
  </a>
  <a href="https://github.com/credred/vue-click-outside-of/actions/workflows/test.yml">
    <img src="https://github.com/credred/vue-click-outside-of/actions/workflows/test.yml/badge.svg"/>
  </a>
</p>

> Vue 3 directive and hook for detecting click outside an element.

English | [简体中文](https://github.com/credred/vue-click-outside-of/blob/main/README.zh-CN.md)

## 🔧Install

```bash
$ npm install --save vue-click-outside-of
or
$ yarn add vue-click-outside-of
```

## 🚀Usage

### Directive

```vue
<template>
  <div v-click-outside="onClickOutside">target1</div>
  <div v-click-outside="vClickOutsideConfig">target2</div>
</template>

<script>
import { ClickOutside } from "vue-click-outside-of";
export default {
  directives: { ClickOutside },
  data() {
    return {
      vClickOutsideConfig: {
        type: "downUp",
        handler: this.handler,
        before: this.before,
      },
    };
  },
  methods: {
    onClickOutside(mousedownEv, mouseupEv) {
      console.log("Clicked outside of target1");
    },
    handler(mousedownEv, mouseupEv) {
      console.log(
        "Clicked outside of target2 (Using config), before callback returned true"
      );
    },
    before(event) {
      return true;
    },
  },
};
</script>
```

<hr />
You can register global directive by following code.

```javascript
import { createApp } from "vue";
import App from "./App.vue";
import VueClickOutsidePlugin from "vue-click-outside-of";

const app = createApp(App);

app.use(VueClickOutsidePlugin).mount("#app");
```

### Hook

```vue
<template>
  <div ref="target">Inside element</div>
  <div>Outside element</div>
</template>

<script>
import { ref } from "vue";
import { onClickOutside } from "vue-click-outside-of";
export default {
  setup() {
    const target = ref(null);
    const option = {
      type: "downUp",
      before: () => {
        return true;
      },
    };

    onClickOutside((mousedownEv, mouseupEv) => {
      console.log("Clicked outside");
    }, target);

    return { target };
  },
};
</script>
```

## 🎗️ escape hatch for Teleport

Sometimes, you may not know which elements should be excluded when you register `click outside handler`. This is why we provide the `markSibling` method.

```vue
<template>
  <div ref="childElementRef">inside element</div>
  <teleport to="body">
    <div ref="teleportElementRef">teleport element</div>
  </teleport>
</template>

<script>
// Child.vue
import { onMounted, ref } from "vue";
import { markSibling } from "vue-click-outside-of";

export default {
  setup() {
    const childElementRef = ref();
    const teleportElementRef = ref();
    onMounted(() => {
      // avoid executing the `click outside handler` which registered
      // on the parent component after the element belonging to `<Teleport>` is clicked.
      markSibling(teleportElementRef.value, childElementRef.value);
    });
    return {
      childElementRef,
      teleportElementRef,
    };
  },
};
</script>
```

```vue
<template>
  <div ref="target">
    <Child></Child>
  </div>
  <div>outside element</div>
</template>

<script>
import { onMounted, ref } from "vue";
import { onClickOutside } from "vue-click-outside-of";
import Child from "./Child.vue";

export default {
  components: {
    Child,
  },
  setup() {
    const target = ref();
    onClickOutside(() => {
      console.log("click outside");
    }, target);
    return { target };
  },
};
</script>
```

## 🎯Options
```typescript
export interface ClickOutsideOption<T extends keyof EventMap> {
  /**
   * Indicates which event should trigger click outside handler.
   *
   * - downUp - *default* value. It was composed of mousedown event and mouseup event.
   *   click outside handler will not trigger as long as one of events target is internal element.
   * - click
   * - dblclick
   *
   * @default "all"
   */
  type?: T;
  /**
   * The click outside handler not executed when click target was contained with excluded element.
   *
   * You can use *before* option also to prevent executing click outside handler.
   */
  exclude?: ClickOutsideTarget;
  /**
   * The function will be executed before executing click outside handler.
   * it should return a boolean to decide click outside handler should be fire or not.
   *
   * You can use *exclude* option also if you want to exclude some element only.
   */
  before?: (...args: Parameters<EventMap[T]>) => boolean;
  /**
   * indicates which button was pressed on the mouse to trigger the click outside handler.
   * The option not support `dblclick` type.
   *
   * - "left"
   * - "right"
   * - "all" -  "default value".
   *
   * @default "all"
   */
  button?: Button;
  /**
   * use capture mode when adding the event listener
   * @default false
   */
  capture?: boolean;
  /**
   * @default document.documentElement
   */
  background?: HTMLElement | Document | Window | SVGElement;
}

export interface EventMap {
  // mousedownEv was undefined if user already pressed mouse before register click outside handler.
  downUp: (mousedownEv: MouseEvent | undefined, mouseupEv: MouseEvent) => void;
  click: (ev: MouseEvent) => void;
  dblclick: (ev: MouseEvent) => void;
}

type ClickOutsideRawTarget = Element | ComponentPublicInstance;

export type ClickOutsideTarget =
  | ClickOutsideRawTarget
  | ClickOutsideRawTarget[]
  | Ref<ClickOutsideRawTarget | undefined>
  | Ref<ClickOutsideRawTarget | undefined>[]
  | ComponentInternalInstance;
```
