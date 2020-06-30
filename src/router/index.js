import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/index'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/home',
      component: HelloWorld
    },
    {
      path: '/home',
      name: 'HelloWorld',
      component: HelloWorld
    },
  ]
})
