import { PluginObject } from 'vue'
import Pic from './pic.vue'
import { PicService } from './pic.service'

export type VuePicSrcReplacer = (
  src: string,
  width: number,
  height: number
) => string

export type VuePicSrcProcessor = {
  src: VuePicSrcReplacer | string
  readySrc: VuePicSrcReplacer | string
  loadingSrc: VuePicSrcReplacer | string
  errorSrc: VuePicSrcReplacer | string
}

type VuePicOptionsType = {
  tagname: string
  offset: number
  enlarge: boolean
  srcProcessor: VuePicSrcProcessor
  screens: {
    [key: string]: number
  }
}

export const VuePic: PluginObject<Partial<VuePicOptionsType>> = {
  install(Vue, userOptions) {
    // defaults
    const options: VuePicOptionsType = {
      tagname: 'pic',
      offset: 100,
      enlarge: false,
      screens: {
        xs: 320,
        sm: 640,
        md: 968,
        lg: 1024,
        xl: 1440,
        xxl: 1920,
      },
      ...userOptions,
      srcProcessor: {
        src: (src: string) => src,
        readySrc: (src, width, height) =>
          `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20${width}%20${height}'%3E%3C/svg%3E`,
        loadingSrc: (src, width, height) =>
          `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20${width}%20${height}'%3E%3C/svg%3E`,
        errorSrc: (src, width, height) =>
          `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20${width}%20${height}'%3E%3C/svg%3E`,
        ...userOptions?.srcProcessor,
      },
    }
    Vue.component(options.tagname, Pic)
    if (window) {
      Vue.prototype.$picService = new PicService(
        options.srcProcessor,
        options.screens,
        options.offset,
        options.enlarge
      )
    }
  },
}
