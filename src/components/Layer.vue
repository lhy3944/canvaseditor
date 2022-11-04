<template>
  <div class="wrapper">
    <div class="top">Layer</div>
    <div class="content">
      <q-list bordered separator>
        <q-item
          v-for="(item, index) in componentList"
          :key="index"
          :active="activeIndex === index"
          clickable
          v-ripple
          active-class="active"
          @click="onClickComponent(index)"
        >
          <q-item-section>
            {{ item.text ? "Textbox" : "Image" }}</q-item-section
          >
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";

export default {
  name: "Layer",
  props: {
    componentList: Array,
  },
  emit: ["emit_selectObject"],
  setup(props, { emit }) {
    let componentList = computed(() => props.componentList);
    let activeIndex = ref(null);

    onMounted(() => {
      console.log(props.componentList);
    });

    const onClickComponent = (componentIndex) => {
      activeIndex.value = componentIndex;
      emit("emit_selectObject", componentIndex);
    };

    return { componentList, activeIndex, onClickComponent };
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  min-width: 30vw;

  .top {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    color: #fff;
    background-color: #333;
  }

  .content {
    .component {
      display: flex;
      padding: 16px 8px;
      border-bottom: 1px solid #d6d6d6;
      cursor: pointer;

      &:hover {
        background-color: #ffc107;
        color: #fff;
      }
    }

    .active {
      background-color: #ffc107;
      color: #fff;
    }
  }
}
</style>
