<template>
  <div id="global-uploader" v-if="gloablState">
    <div class="enlarge">
      <div class="file-title">
        <div>{{label}}</div>
        <div class="operate">
          <el-button @click="fileListShow" type="text" :title="collapse ? '展开':'折叠' ">
            <i :class="collapse ? 'el-icon-folder-add': 'el-icon-folder-remove'"></i>
          </el-button>

          <el-button @click="close" type="text" title="关闭">
            <i class="el-icon-close"></i>
          </el-button>
        </div>
      </div>
      <!-- 上传 -->
      <div class="upload-bottom" v-show="showUpload">
        <uploader
          ref="uploader"
          :options="options"
          :autoStart="true"
          @file-added="onFileAdded"
          @file-success="onFileSuccess"
          @file-progress="onFileProgress"
          @file-error="onFileError"
          @file-submitted="filesSubmitted"
          :file-status-text="fileStatusText"
          class="uploader-app"
        >
          <uploader-unsupport></uploader-unsupport>
          <div class="but-upload">
            <uploader-btn
              id="global-uploader-btn"
              :attrs="attrs"
              ref="uploadBtn"
              size="mini"
              type="primary"
            >{{label}}</uploader-btn>
          </div>
          <uploader-list v-show="panelShow">
            <div class="file-panel" slot-scope="props" :class="{'collapse': collapse}">
              <ul class="file-lists">
                <li v-for="(file) in props.fileList" :key="file.id" class="upload-list-file">
                  <!-- <span class="file-img">
                    <img :src="imgFileUrl[index]" alt width="100%" height="100%" />
                  </span>-->
                  <uploader-file :class="'file_' + file.id" ref="files" :file="file" :list="true"></uploader-file>
                </li>
                <div class="no-file" v-if="!props.fileList.length">
                  <i class="iconfont icon-empty-file"></i> 暂无待上传文件
                </div>
              </ul>
            </div>
          </uploader-list>
        </uploader>
      </div>
    </div>
  </div>
</template>

<script>
/*
 */

import SparkMD5 from "spark-md5";
import { mapState, mapGetters } from "vuex";

export default {
  mame: "",
  data() {
    return {
      options: {
        target: `${process.env.API_ROOT}/manage/photo/uploadPhoto`, //上传地址根据自己的需求调整
        chunkSize: "1048576",
        fileParameterName: "file",
        maxChunkRetries: 0,
        simultaneousUploads: 2, //并发上传数
        testChunks: true, //是否开启服务器分片校验
        categoryMap: {},
        // 服务器分片校验函数，秒传及断点续传基础
        checkChunkUploadedByResponse: function(chunk, message) {
          let objMessage = JSON.parse(message);
          if (objMessage.data.download) {
            return true;
          }
          return (
            (objMessage.data.oldChunks || []).indexOf(chunk.offset + 1) >= 0
          );
        },
        // 处理请求结果
        processResponse: function(response, cb, File, chunk) {
          let objMessage = JSON.parse(response);
          if (!objMessage.success) {
            cb(true, File.error);
          } else {
            cb(null, response);
          }
        },
        headers: {
          // Authorization: window.localStorage.getItem("Authorization") //上传携带头部
        },
        parseTimeRemaining: function(timeRemaining, parsedTimeRemaining) {
          return parsedTimeRemaining
            .replace(/\syears?/, "年")
            .replace(/\days?/, "天")
            .replace(/\shours?/, "小时")
            .replace(/\sminutes?/, "分钟")
            .replace(/\sseconds?/, "秒");
        },
        successStatuses: [200, 201, 202],
        permanentErrors: [404, 415, 500, 501, 502]
      },
      attrs: { accept: 'image/*' },
      fileStatusText(status, response) {
        const statusTextMap = {
          uploading: "上传中",
          paused: "暂停",
          waiting: "等待中"
        };
        if (status === "success") {
          return "上传成功";
        } else if (status === "error") {
          return "上传失败";
        } else {
          return statusTextMap[status];
        }
      },
      panelShow: false, //选择文件后，展示上传panel
      collapse: false,
      showUpload: true,
      imgFileUrl: []
    };
  },
  computed: {
    //Uploader实例
    uploader() {
      return this.$refs.uploader.uploader;
    },
    ...mapState(["gloablState", "label", "type"])
  },
  watch: {
    type: {
      handler: function(val) {},
      deep: true,
      immediate: true
    }
  },
  //注册局部组件指令
  directives: {
    drag: function(el) {
      let dragBox = el; //获取当前元素
      dragBox.onmousedown = e => {
        //算出鼠标相对元素的位置
        let disX = e.clientX - dragBox.offsetLeft;
        let disY = e.clientY - dragBox.offsetTop;
        document.onmousemove = e => {
          //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
          let left = e.clientX - disX;
          let top = e.clientY - disY;
          //移动当前元素
          dragBox.style.right = dragBox.offsetWidth - left + "px";
          dragBox.style.bottom = dragBox.offsetHeight - top + "px";
        };
        document.onmouseup = e => {
          //鼠标弹起来的时候不再移动
          document.onmousemove = null;
          //预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
          document.onmouseup = null;
        };
      };
    }
  },
  methods: {
    filesSubmitted(files, fileList, event) {
      // console.log(files, fileList, event);
    },
    removeFile(file) {},
    onFileAdded(file, event) {
      this.panelShow = true;
      file.pause();
      if (file) {
        let isLt2M = file.size / 1024 / 1024 < 20;
        if (!isLt2M) {
          file.cancel();
          file.ignored = true;
          this.$message.error("上传文件大小不能超过 20MB!");
        } else {
          // let reader = new FileReader();
          // reader.readAsDataURL(file.file);
          // let _this = this;
          // reader.onload = function(e) {
          //   let base = e.target.result;
          //   _this.imgFileUrl.push(base);
          // };
          this.computeMD5(file);
        }
      }
    },
    onFileProgress(rootFile, file, chunk) {},
    onFileSuccess(rootFile, file, response, chunk) {
      let res = JSON.parse(response);
    },
    onFileError(rootFile, file, response, chunk) {
      this.$message({
        message: "上传失败",
        type: "error"
      });
    },

    /**
     * 计算md5，实现断点续传及秒传
     * @param file
     */
    computeMD5(file) {
      let fileReader = new FileReader();
      let time = new Date().getTime();
      let blobSlice =
        File.prototype.slice ||
        File.prototype.mozSlice ||
        File.prototype.webkitSlice;
      let currentChunk = 0;
      const chunkSize = 10 * 1024 * 1000;
      let chunks = Math.ceil(file.size / chunkSize);
      let spark = new SparkMD5.ArrayBuffer();

      // 文件状态设为"计算MD5"
      // this.statusSet(file.id, "md5");
      file.pause();
      loadNext();
      fileReader.onload = e => {
        spark.append(e.target.result);
        if (currentChunk < chunks) {
          currentChunk++;
          loadNext();
          // 实时展示MD5的计算进度
          this.$nextTick(() => {});
        } else {
          let md5 = spark.end();
          this.computeMD5Success(md5, file);
        }
      };

      fileReader.onerror = function() {
        this.error(`文件${file.name}读取出错，请检查该文件`);
        file.cancel();
      };

      function loadNext() {
        let start = currentChunk * chunkSize;
        let end =
          start + chunkSize >= file.size ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
      }
    },

    computeMD5Success(md5, file) {
      // 将自定义参数直接加载uploader实例的opts上
      Object.assign(this.uploader.opts, {
        query: {
          ...this.params
        }
      });

      file.uniqueIdentifier = md5;
      file.resume();
      this.statusRemove(file.id);
    },
    //收缩
    fileListShow() {
      let _this = this;
      _this.collapse = !_this.collapse;
      _this.showUpload = !this.showUpload;
    },
    //关闭
    close() {
      let upState = this.uploader.isUploading();
      let isComplete = this.uploader.isComplete();
      this.uploader.cancel();
      this.$store.commit("initUpload", {
        accept: "image",
        state: false
      });
    },
    /**
     * 新增的自定义的状态: 'md5'、'transcoding'、'failed'
     * @param id
     * @param status
     */
    statusSet(id, status) {},
    statusRemove(id) {},

    error(msg) {
      this.$message({
        title: "错误",
        message: msg,
        type: "error",
        duration: 2000
      });
    }
  },
  components: {}
};
</script>

<style scoped lang="scss">
#global-uploader {
  position: fixed;
  z-index: 3000;
  right: 15px;
  bottom: 15px;
  background-color: #fff;
  border: 1px solid #e2e2e2;
  border-radius: 7px 7px 0 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  cursor: move;
  ::v-deep .uploader-file-name {
    text-align: left;
  }
  ::v-deep .uploader-file-icon {
    display: none;
  }
  .enlarge {
    width: 650px;
    overflow: auto;
  }
  .file-title {
    display: flex;
    height: 40px;
    line-height: 40px;
    padding: 0 15px;
    border-bottom: 1px solid #ddd;
    .operate {
      flex: 1;
      text-align: right;
    }
  }
  .overFlow-hidden {
    min-height: 500px;
    max-height: 650px;
  }
  ::v-deep .el-button--text {
    padding: 0 10px;
  }
  ::v-deep .uploader-file-icon {
    &:before {
      content: "" !important;
    }

    &[icon="image"] {
      background: none;
    }
    // &[icon="video"] {
    //   background: center / contain no-repeat url(../../common/video.png);
    // }
    //   &[icon=document] {
    //       background: url(../images/text-icon.png);
    //   }
  }
  .uploader-app {
    overflow: auto;
    padding-right: 20px;
  }
  .but-upload {
    text-align: left;
    margin-top: 10px;
  }
  .upload-bottom {
    height: 500px;
    overflow: auto;
  }
  .file-panel {
    .file-title {
      display: flex;
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      border-bottom: 1px solid #ddd;

      .operate {
        flex: 1;
        text-align: right;
      }
    }

    .file-lists {
      position: relative;
      // height: 540px;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: #fff;
      > li {
        background-color: #fff;
      }
    }

    &.collapse {
      .file-title {
        background-color: #cfd7e5;
      }
    }
  }

  .no-file {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
  }

  ul,
  li {
    list-style: none;
  }
  .header-list {
    display: flex;
    justify-content: flex-start;
    margin-top: 10px;
    padding: 0 20px;
  }
  .total-num {
    font-size: 14px;
    color: #606266;
    height: 32px;
    line-height: 32px;
    margin-right: 20px;
    width: 200px;
  }
}
/* 隐藏上传按钮 */
#global-uploader-btn {
  // position: absolute;
  // clip: rect(0, 0, 0, 0);
  background: #409eff;
  color: #fff;
  border: none;
  margin-left: 20px;
  font-size: 14px;
}
::v-deep .uploader-file-actions > span {
  margin-right: 6px;
}
.submit-bot {
  text-align: center;
  margin: 10px 0;
}
.upload-list-file {
  position: relative;
}
.file-img {
  width: 24px;
  height: 24px;
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
}
</style>