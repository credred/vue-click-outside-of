<h1 align="center">vue-click-outside-of</h1>

> Vue 3 监听元素外点击事件的指令和钩子.

[English](https://github.com/credred/vue-click-outside-of/blob/main/README.md) | 简体中文

## 🔧安装
```bash
$ npm install --save vue-click-outside-of
或者
$ yarn add vue-click-outside-of
```

## 🎯选项
### type
决定哪个事件应该触发`click outside 回调函数`.

- downUp - *默认值*. 它由`mousedown`事件以及`mouseup`事件组成. 只要有一个事件目标属于内部元素,`click outside 回调函数`就不会被执行.
- click
- dblclick
### before
这个函数在`click outside 回调函数`被执行前触发.

它应该返回一个`布尔`值去决定`click outside 回调函数`是否应该被执行

### exclude
一个`element`或一个`element 数组`. 如果这个值包含`事件目标`, `click outside 回调函数`不会被执行.
### button
决定鼠标哪个按键应该触发`click outside 回调函数`. 这个选项不支持 "dblclick" 类型.

- "left"
- "right"
- "all" -  *默认值*.

## 🚀使用
### 指令

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
您还可以通过以下代码注册全局指令.

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

## 🎗️ Teleport 的逃生舱
有时，你在注册`click outside 回调函数`时可能并不知道你应该排除哪些元素.所以我们提供了`markSibling` 方法.
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
      // 在属于 `<Teleport>` 的元素被点击后, 避免执行注册在父组件的 `click outside 回调函数`.
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
