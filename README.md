<h1 align="center">vue-click-outside-of</h1>

> Vue 3 directive and hook for detecting click outside an element.

English | [简体中文](https://github.com/credred/vue-click-outside-of/blob/main/README.zh-CN.md)

## 🔧Install
```bash
$ npm install --save vue-click-outside-of
or
$ yarn add vue-click-outside-of
```

## 🎯Options
### type
Indicates which event should trigger `click outside handler`.
- downUp - *default value*. It was composed of mousedown event and mouseup event. `click outside handler` will not trigger as long as one of events target is internal element.
- click
- dblclick
### before
The function will be executed before executing `click outside handler`.

It should return a `boolean` to decide `click outside handler` should be fire or not.
### exclude
An `element` or An `Array of elements`. The `click outside handler` not executed when click target was contained with excluded element.
### button
Indicates which button was pressed on the mouse to trigger the `click outside handler`. The option not support `dblclick` type.
- "left"
- "right"
- "all" -  *default value*.

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

## 🎗️escape hatch for teleport element
```vue
<template>
  <div ref="target">
    <div ref="childElementRef">inside element</div>
    <teleport to="body">
      <div ref="teleportElementRef">teleport element</div>
    </teleport>
  </div>
  <div>outside element</div>
</template>

<script>
import { onMounted, ref } from "vue";
import { onClickOutside, markSibling } from "vue-click-outside-of";

export default {
  setup() {
    const target = ref();
    const childElementRef = ref();
    const teleportElementRef = ref();
    onClickOutside(() => {
      console.log("click outside");
    }, target);
    onMounted(() => {
      // avoid `click outside handler` was executed when clicked on teleport element
      markSibling(teleportElementRef.value, childElementRef.value);
    });
    return {
      target,
      childElementRef,
      teleportElementRef,
    };
  },
};
</script>
```
