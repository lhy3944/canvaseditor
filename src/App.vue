<template>
  <Editor></Editor>
</template>

<script>
import Editor from "@/components/Editor.vue";

export default {
  name: "App",
  components: { Editor },
  setup() {
    return {};
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  top: 0;
  left: 0;
  margin: 0;
}
</style>
