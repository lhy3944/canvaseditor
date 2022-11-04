<template>
  <div class="tools">
    <!-- 텍스트 Color 변경 -->
    <div class="textColor">
      <q-input filled v-model="color" class="colorPicker">
        <template v-slot:append>
          <q-icon name="colorize" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-color
                v-model="color"
                no-header-tabs
                @update:model-value="changeColor"
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
    <!-- 폰트 변경 -->
    <div class="textFont"></div>
    <!-- 폰트 사이즈 변경 -->
    <div class="textFontSize"></div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "Toolbar",
  emits: ["emit_changeColor"],
  setup(props, { emit }) {
    const color = ref("#000000");

    const changeColor = () => {
      emit("emit_changeColor", color.value);
    };

    return { color, changeColor };
  },
};
</script>

<style lang="scss" scoped>
.tools {
  display: flex;
}
.colorPicker {
  max-width: 120px;
  background-color: #fff;
}
</style>
