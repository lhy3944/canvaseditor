<template>
  <div class="container">
    <!-- 에디터 -->
    <div class="editor">
      <div class="top">Image Editor</div>
      <div class="content">
        <div id="canvas-container">
          <canvas ref="canvasRef" width="640" height="360"></canvas>
        </div>
      </div>
      <div class="bottom">
        <Toolbar v-show="showTools" @emit_changeColor="changeColor"></Toolbar>
      </div>
    </div>
    <!-- 레이어 리스트 -->
    <div class="layer">
      <Layer
        v-if="isReady"
        :componentList="componentList"
        @emit_selectObject="selectObject"
      ></Layer>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { fabric } from "fabric";
import Toolbar from "@/components/Toolbar.vue";
import Layer from "@/components/Layer.vue";
import MOCK_1 from "/public/meta/mock_1.json";

export default {
  name: "Editor",
  components: {
    Toolbar,
    Layer,
  },
  setup() {
    const SCALE_DOWN_LEVEL = 3;
    let canvasContext = null;
    let canvasRef = ref(null);
    let activeObject = ref(null);
    let showTools = ref(false);
    let isReady = ref(false);
    let componentList = computed(() =>
      canvasContext ? canvasContext.getObjects() : []
    );

    onMounted(() => {
      canvasContext = createCanvas();
      loadResource();

      // Canvas 이벤트 => 오브젝트 선택
      canvasContext.on({
        "selection:updated": handleSelectObject,
        "selection:created": handleSelectObject,
      });
      // Canvas 이벤트 => 오브젝트 선택 해제
      canvasContext.on("selection:cleared", clearObject);
      // Window resize 이벤트
      window.addEventListener("resize", resizeHandler);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", resizeHandler);
    });

    /**
     * Canvas 생성
     */
    const createCanvas = () => {
      return new fabric.Canvas(canvasRef.value, {
        preserveObjectStacking: true, // 오브젝트를 선택해도 layer를 유지하는 옵션
        stopContextMenu: true,
      });
    };

    /**
     * 템플릿 데이터 로드
     */
    const loadResource = async () => {
      let svgResource = convertToSVGResource();

      // Image
      if (svgResource.imageResources) {
        await loadImageResource(svgResource.imageResources).then((res) => {
          drawImageResources(res);
        });
      }
      // Text
      if (svgResource.textResources) {
        await drawTextResources(svgResource.textResources);
      }
      // Canvas 랜더링 완료
      isReady.value = true;
    };

    /**
     * 이미지 리소스 Canvas에 포함
     *
     * @param {*} imageResources
     */
    const drawImageResources = (imageResources) => {
      imageResources.forEach((image) => {
        let layout = image.layout;
        let imgObj = new fabric.Image(image);
        imgObj.set({
          left: layout.origin.x / SCALE_DOWN_LEVEL,
          top: layout.origin.y / SCALE_DOWN_LEVEL,
          width: layout.size.width / SCALE_DOWN_LEVEL,
          height: layout.size.height / SCALE_DOWN_LEVEL,
        });

        canvasContext.add(imgObj);
      });
    };

    /**
     * 이미지 preload
     *
     * @param {*} imageResources
     */
    const loadImageResource = (imageResources) => {
      let imageObjectList = [];
      let imageLoadedCount = 0;

      return new Promise((resolve) => {
        imageResources.forEach((image, index) => {
          let layout = image.layoutAttributes;
          let component = image.componentAttributes;
          let imageObj = new Image();
          imageObj.index = index;
          imageObj.src = component.attributes.location;
          imageObj.layout = layout;
          imageObjectList.push(imageObj);

          // image preload
          imageObj.onload = () => {
            imageLoadedCount += 1;
            if (imageLoadedCount === imageResources.length) {
              resolve(imageObjectList);
            }
          };
        });
      });
    };

    /**
     * 텍스트 리소스 Canvas에 포함
     *
     * @param {*} textResources
     */
    const drawTextResources = (textResources) => {
      textResources.forEach((item) => {
        let component = item.componentAttributes;
        let layout = item.layoutAttributes;
        if (component && layout) {
          let componentAttr = component.attributes;
          let textBox = new fabric.Textbox(componentAttr.content, {
            fill: componentAttr.color,
            fontFamily: layout.font,
            fontWeight: layout["font-Weight"],
            fontSize: layout.fontsize / SCALE_DOWN_LEVEL,
            width: layout.size.width / SCALE_DOWN_LEVEL,
            height: layout.size.height / SCALE_DOWN_LEVEL,
            lineHeight: layout["text-line-spacing"],
            left: layout.origin.x,
            top: layout.origin.y,
          });
          canvasContext.add(textBox);
        }
      });
    };

    /**
     * 각 리소스 타입별 리소스 변환
     */
    const convertToSVGResource = () => {
      let svgResource = {};
      let imageResources = [];
      let textResources = [];
      let shapeResources = [];
      let providerMetadata = MOCK_1.providerMetadata;

      if (providerMetadata) {
        let layout = providerMetadata.layout;
        let components = providerMetadata.components;

        if (layout && components) {
          // Layout loop
          layout.forEach((item) => {
            let layoutAttributes = item.attributes;
            let componentAttributes = components.find(
              (comp) => comp.id === item.id
            );
            let attributes = {
              layoutAttributes,
              componentAttributes,
            };

            if (
              item.subtype === "Background" ||
              item.subtype === "Image" ||
              item.subtype === "Sticker"
            ) {
              imageResources.push(attributes);
            } else if (item.subtype === "TextBox") {
              textResources.push(attributes);
            } else if (item.subtype === "Shape") {
              shapeResources.push(attributes);
            }
          });
          svgResource.imageResources = imageResources;
          svgResource.textResources = textResources;
        }
      }
      return svgResource;
    };

    const handleSelectObject = (item) => {
      let object = item.selected[0];
      activeObject.value = object;
      showTools.value = object.text ? true : false;
    };

    const clearObject = () => {
      activeObject.value = null;
      showTools.value = false;
    };

    const changeColor = (color) => {
      console.log(color);
      canvasContext.getActiveObject().set("fill", color);
      canvasContext.renderAll();
    };

    const selectObject = (objectIndex) => {
      canvasContext.setActiveObject(canvasContext.item(objectIndex));
      canvasContext.renderAll();
    };

    const resizeHandler = () => {
      canvasContext.setHeight(
        document.getElementById("canvas-container").clientHeight
      );
      canvasContext.setWidth(
        document.getElementById("canvas-container").clientWidth
      );
      // let objects = canvasContext.getObjects();
      // for (var i in objects) {
      //   objects[i].scale(canvasContext.getWidth / 3);
      // }
      canvasContext.renderAll();
    };

    return {
      canvasRef,
      showTools,
      activeObject,
      changeColor,
      componentList,
      isReady,
      selectObject,
    };
  },
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  width: 100%;
  border-bottom: 1px solid #d6d6d6;
}
.editor {
  display: flex;
  flex-direction: column;
  width: 50vw;
  margin: 0 auto;
}
.top {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 30px;
  color: #fff;
  background-color: #333;
}
#canvas-container {
  border: 1.5px #d6d6d6 solid;
  border-radius: 7px;
}

.bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60px;
  background-color: #444;
}

.layer {
  border-left: 1px solid #d6d6d6;
}
</style>
