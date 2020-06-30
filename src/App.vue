<template>
  <div id="app">
    <router-view/>
    <global-upload></global-upload>
  </div>
</template>

<script>
import GlobalUpload from './components/Upload'
export default {
  name: 'App',
  components: { GlobalUpload }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}
</style>
