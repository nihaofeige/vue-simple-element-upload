<template>
  <div class="upload-but">
    <el-button
      :type="item.type"
      size="small"
      @click="butUpload(item)"
      v-for="item in butTabs"
      :key="item.value"
    >
      {{item.label}}
      <i class="el-icon-upload el-icon--right"></i>
    </el-button>
    <div class="vue-drag-resize">
      <!-- <vue-drag-resize
        :w="200"
        :h="200"
        v-on:resizing="resize"
        v-on:dragging="resize"
        :isActive="true"
        :isResizable="true"
      > -->
        <!-- 图片缩放 -->
        <!-- 将这个div的宽高动态设置==VueDrangResize的宽高，这样可实时完成缩放 -->
        <!-- <div class="box" :style="{width: + vw+ 'px',height:+vh+'px'}"> -->
          <!-- 我这写的是本地的图片，图片可以动态获取 -->
          <!-- <img src="../assets/logo.png" width="100%" height="100%" /> -->
        <!-- </div> -->
      <!-- </vue-drag-resize> -->
    </div>
  </div>
</template>

<script>
import VueDragResize from "vue-drag-resize";
export default {
  name: "",
  components: { VueDragResize },
  data() {
    return {
      butTabs: [
        { label: "上传图片", value: "image", type: "primary" },
        { label: "上传视频", value: "video", type: "success" },
        { label: "上传文件", value: "document", type: "warning" },
        { label: "上传音频", value: "audio", type: "danger" }
      ],
      vw: 0,
      vh: 0,
      top: 0,
      left: 0
    };
  },
  created() {
    this.vw = 200 + "px";
    this.vh = 200 + "px";
  },

  methods: {
    resize(newRect) {
      this.vw = newRect.width;
      this.vh = newRect.height;
      this.top = newRect.top;
      this.left = newRect.left;
    },
    butUpload(item) {
      let _this = this;
      _this.$store.commit("initUpload", {
        accept: item.value,
        label: item.label,
        state: true
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.upload-but {
  padding: 20px;
  text-align: left;
  .vue-drag-resize {
    margin-top: 20px;
    position: relative;
  }
}
</style>