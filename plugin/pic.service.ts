import Pic from './pic.vue'
import { VuePicSrcProcessor, VuePicSrcReplacer } from './index'

type PicComp = InstanceType<typeof Pic>

type PicDimensions = {
  width: number
  height: number
}

export type SizesObjType = {
  [key: string]: string
}
type SrcSetItemType = {
  src: string
  width: number
  height: number
  size: string
}

// type NumericSizesObjType = {
//   [key: number]: string
//   default?: string
// }

const DEFAULT_SIZE_KEY = 'default'
const DEFAULT_SIZE_VAL = '100vw'

export class PicService {
  private readonly observer: IntersectionObserver
  private readonly lazyComponents: PicComp[] = []

  constructor(
    private readonly srcProcessor: VuePicSrcProcessor,
    private readonly screens: { [key: string]: number },
    offset = 100,
    private readonly enlarge = false
  ) {
    this.observer = new IntersectionObserver(this.callback, {
      threshold: 0,
      rootMargin: `${offset}px`,
    })
  }

  /*
    Converts string or object sizes to sorted(by screen width) object and adds default
   */
  parseSizes(sizes: string | SizesObjType = ''): SizesObjType {
    // sm:100vw lg:50vw 30vw 80vw
    let sizesParsed: SizesObjType
    if (typeof sizes === 'string') {
      const sizesArr = sizes.split(' ')
      sizesParsed = sizesArr.reduce<SizesObjType>((obj, el) => {
        const [key, val] = el.split(':')
        if (val) {
          obj[key] = val
        } else {
          obj[DEFAULT_SIZE_KEY] = key
        }
        return obj
      }, {})
    } else {
      sizesParsed = sizes
    }

    const sortedSizes: SizesObjType = sizesParsed
      ? Object.keys(sizesParsed)
          .filter((screen) => this.screens?.[screen])
          .sort((a, b) => {
            return this.screens[a] - this.screens[b]
          })
          .reduce<SizesObjType>((obj, key) => {
            obj[key] = sizesParsed[key]
            return obj
          }, {})
      : {}
    sortedSizes[DEFAULT_SIZE_KEY] =
      sizesParsed?.[DEFAULT_SIZE_KEY] || DEFAULT_SIZE_VAL

    return sortedSizes
  }

  /*
   *  Genereate string for sizes html attribute
   *  @sizes - SORTED OBJECT
   */
  public stringifySizes(sizes: SizesObjType): string {
    const strSizes = Object.keys(sizes)
      .filter((el) => el !== DEFAULT_SIZE_KEY)
      .map(
        (screen) => `(min-width: ${this.screens[screen]}px) ${sizes[screen]}`
      )
      .join(', ')
    if (strSizes.length === 0) {
      if (sizes[DEFAULT_SIZE_KEY] === DEFAULT_SIZE_VAL) {
        return ''
      }
      return sizes.default
    }
    return `${strSizes}, ${sizes.default}`
  }

  public resizeByWidth(
    width: number,
    height: number,
    newWidth: number
  ): PicDimensions {
    let w = newWidth
    let h = height * (newWidth / width)

    // We need Integer for image sizes
    while (!Number.isInteger(w) || !Number.isInteger(h)) {
      w++
      h = height * (w / width)
    }

    return {
      width: w,
      height: h,
    }
  }

  public genSrcSet(
    src: string,
    baseWidth: number,
    baseHeight: number,
    sizes: SizesObjType,
    multipliers: number[] = []
  ): SrcSetItemType[] {
    // We should call srcProcess converting sizes value to number width like follows
    // 100px -> 100
    // 100vw -> suitable size from screens
    // 50vw  -> suitable size from screens  / 2
    // md:50vw 100vw -> screens 0-md /2  and  screens md - because default it the smallest
    // md:500px 100vw -> screens 0-md 500  screens md

    const srcSets: SrcSetItemType[] = []
    // sizes are sorted by screen size and default is last

    const pushSrc = (screen: number, size: string) => {
      const forWidth = size.endsWith('vw')
        ? screen * (parseInt(size) / 100)
        : parseInt(size)

      ;[...new Set([1, ...multipliers])].forEach((multiplier) => {
        const { width, height } = this.resizeByWidth(
          baseWidth,
          baseHeight,
          forWidth * multiplier
        )
        if (this.enlarge || width <= baseWidth) {
          srcSets.push({
            src: this.getSrc(src, width, height),
            width,
            height,
            size: `${width}w`,
          })
        }
      })
    }

    let currentSize = sizes?.default || DEFAULT_SIZE_VAL
    for (const screen in this.screens) {
      if (sizes[screen]) {
        currentSize = sizes[screen]
      }

      pushSrc(this.screens[screen], currentSize)
    }

    return srcSets
      .filter(
        (el, index, self) =>
          self.findIndex((els) => els.src === el.src) === index
      )
      .sort((a, b) => a.width - b.width)
  }

  public stringifySrcSet(srcSets: SrcSetItemType[]): string {
    return srcSets.map(({ src, size }) => `${src} ${size}`).join(', ')
  }

  private srcProcess(
    srcProcessor: VuePicSrcReplacer | string,
    src: string,
    width: number,
    height: number
  ): string {
    if (typeof srcProcessor === 'string') {
      return srcProcessor
    }
    return srcProcessor(src, width, height)
  }

  public getSrc(src: string, width: number, height: number): string {
    const { src: srcProcessor } = this.srcProcessor
    return this.srcProcess(srcProcessor, src, width, height)
  }

  public getLoadingSrc(src: string, width: number, height: number): string {
    const { loadingSrc: srcProcessor } = this.srcProcessor
    return this.srcProcess(srcProcessor, src, width, height)
  }
  public getErrorSrc(src: string, width: number, height: number): string {
    const { errorSrc: srcProcessor } = this.srcProcessor
    return this.srcProcess(srcProcessor, src, width, height)
  }
  public getReadySrc(src: string, width: number, height: number): string {
    const { readySrc: srcProcessor } = this.srcProcessor
    return this.srcProcess(srcProcessor, src, width, height)
  }

  public addComponent(vuePicComponent: PicComp): void {
    this.lazyComponents.push(vuePicComponent)
    this.observer.observe(vuePicComponent.$el)
  }

  getComponentByEl(element: Element) {
    return this.lazyComponents.find((comp) => comp.$el === element)
  }

  private callback: IntersectionObserverCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const comp: any = this.getComponentByEl(entry.target)
        if (comp) {
          console.log('intersected')
          comp.intersected()
        }
        this.observer.unobserve(entry.target)
      }
      //
      // entry.time // a DOMHightResTimeStamp indicating when the intersection occurred.
      // entry.rootBounds // a DOMRectReadOnly for the intersection observer's root.
      // entry.boundingClientRect // a DOMRectReadOnly for the intersection observer's target.
      // entry.intersectionRect // a DOMRectReadOnly for the visible portion of the intersection observer's target.
      // entry.intersectionRatio // the number for the ratio of the intersectionRect to the boundingClientRect.
      // entry.target // the Element whose intersection with the intersection root changed.
      // entry.isIntersecting // intersecting: true or false
    })
  }
}
