<template>
  <img
    :src="actualSrc"
    :srcset="actualSrcSet"
    :sizes="sctualSizes"
    :lazy="state"
    :width="w"
    :height="h"
  />
</template>

<script lang="ts">
import Vue from 'vue'
import { SizesObjType } from './pic.service'

enum PicStateEnum {
  ready = 'ready',
  loading = 'loading',
  finished = 'finished',
  error = 'error',
}

export default Vue.extend({
  name: 'pic',
  props: {
    // lazy: Boolean - we should allow switch off lazy, for using component for generating srcset on ssr
    src: {
      type: String,
      required: true,
    },
    animate: {
      type: Boolean,
      default: false,
    },
    width: {
      type: [String, Number],
      required: true,
      validator(val: string | number) {
        const strVal = val.toString()
        return `${parseInt(strVal)}` === strVal
      },
    },
    height: {
      type: [String, Number],
      required: true,
      validator(val: string | number) {
        const strVal = val.toString()
        return `${parseInt(strVal)}` === strVal
      },
    },
    sizes: {
      type: [String, Object],
      default: null,
      validator(val: string | SizesObjType) {
        if (typeof val === 'string') {
          return /([a-z]+:\d+(px|vw)\S?)+/.test(val)
        } else {
          return Object.values(val).every((el) => /\d+(px|vw)/.test(el))
        }
      },
    },
    // [2] - etc, it won't place 2x but will add image with x2 size, browser will use it on dpr2
    srcsetDpr: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      state: '',
    }
  },
  computed: {
    w(): number {
      return parseInt(`${this.width}`)
    },
    h(): number {
      return parseInt(`${this.height}`)
    },
    sizesObj(): SizesObjType {
      return this.$picService.parseSizes(this.sizes as string | SizesObjType)
    },
    actualSrc(): string {
      switch (this.state) {
        case PicStateEnum.loading:
          return this.$picService.getLoadingSrc(this.src, this.w, this.h)
        case PicStateEnum.error:
          return this.$picService.getErrorSrc(this.src, this.w, this.h)
        case PicStateEnum.finished:
          return this.$picService.getSrc(this.src, this.w, this.h)
        case PicStateEnum.ready:
        default:
          return this.$picService.getReadySrc(this.src, this.w, this.h)
      }
    },
    actualSrcSet(): string | null {
      if (this.state === PicStateEnum.finished) {
        const srcSet = this.$picService.genSrcSet(
          this.src,
          this.w,
          this.h,
          this.sizesObj
        )
        return this.$picService.stringifySrcSet(srcSet)
      }
      return null
    },
    sctualSizes(): string | null {
      return this.$picService.stringifySizes(this.sizesObj) || null
    },
  },
  created() {
    this.state = PicStateEnum.ready
  },
  methods: {
    intersected(): void {
      this.load()
    },
    load() {
      this.state = PicStateEnum.loading

      const img = new Image()
      img.onload = () => {
        this.$nextTick(() => {
          this.state = PicStateEnum.finished
        })
      }
      img.onerror = () => {
        this.state = PicStateEnum.error
      }
      img.src = this.src
    },
  },
  mounted() {
    if (this.$picService) {
      this.$picService.addComponent(this)
    }
  },
})
</script>

<style scoped>
img {
  width: 100%;
  height: auto;
}
.debug[lazy='ready'] {
  border: 5px dimgrey solid;
}
.debug[lazy='loading'] {
  border: 5px dodgerblue solid;
}
.debug[lazy='finished'] {
  border: 5px green solid;
}
.debug[lazy='error'] {
  border: 5px red solid;
}
</style>
