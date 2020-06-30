export default {
  state: {
    label: '',
    gloablState: false,
    categoryMap : {
      image: ['.png', '.jpg', '.jpeg', '.gif',],
      video: ['.mp4'],
      audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'],
      document: ['doc', 'txt', 'docx', 'pages', 'epub', 'pdf', 'numbers', 'csv', 'xls', 'xlsx', 'keynote', 'ppt', 'pptx']
    },
    type: 'image',
    accept: {
      accept: []
    }, //文件类型
  },
  mutations: {
    initUpload(state, payload) {
      state.type = payload.accept
      state.label = payload.label
      state.gloablState = payload.state
    }
  },
  getters: {
    fileType(state) {
      return state.accept
    }
  },
  actions: {

  }
}