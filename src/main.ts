import Vue from 'vue'
import App from './App.vue'
import { VuePic } from '../plugin'

Vue.config.productionTip = false
Vue.use(VuePic, {
  srcProcessor: {
    src: (url: string, width = 0, height = 0) => {
      //picsum.photos/id/237/200/300
      const cdnRegEx = /https?:\/\/picsum\.photos/
      if (!cdnRegEx.test(url) || /\S+\.svg/.test(url)) {
        // Этой картинке уже не помочь, ресайзилка нацелена на конкретный бакет и не умеет ресайзить svg
        return url
      }
      const urlparts = url.split('/')
      urlparts[5] = `${width}`
      urlparts[6] = `${height}`
      return urlparts.join('/')
    },
    loadingSrc: (url: string, width = 0, height = 0) => {
      //picsum.photos/id/237/200/300
      const cdnRegEx = /https?:\/\/picsum\.photos/
      if (!cdnRegEx.test(url) || /\S+\.svg/.test(url)) {
        // Этой картинке уже не помочь, ресайзилка нацелена на конкретный бакет и не умеет ресайзить svg
        return url
      }
      const urlparts = url.split('/')
      urlparts[5] = `${width / 10}`
      urlparts[6] = `${height / 10}`
      return urlparts.join('/')
    },
  },
})
new Vue({
  render: (h) => h(App),
}).$mount('#app')
