import './__mocks__/intersection-observer'
import { PicService } from '../../plugin/pic.service'
import { VuePicSrcProcessor } from '../../plugin'

const srcProcessor: VuePicSrcProcessor = {
  src: (src, width, height) => `${src}(${width}x${height})`,
  readySrc: (src, width, height) => `ready:${src}(${width}x${height})`,
  loadingSrc: (src, width, height) => `loading:${src}(${width}x${height})`,
  errorSrc: (src, width, height) => `error:${src}(${width}x${height})`,
}

const screens = {
  xs: 100,
  sm: 200,
  md: 300,
  lg: 400,
  xl: 500,
  xxl: 600,
}

const picService = new PicService(srcProcessor, screens)

describe('PicService', () => {
  it('parseSizes - filter out not existing screens', () => {
    expect(
      picService['parseSizes']('md:100vw notexist:200vw lg:500px sm:100vw 50vw')
    ).toEqual({
      sm: '100vw',
      md: '100vw',
      lg: '500px',
      default: '50vw',
    })
  })
  it('parseSizes - sorting', () => {
    expect(picService['parseSizes']('md:100vw lg:500px sm:100vw 50vw')).toEqual(
      {
        sm: '100vw',
        md: '100vw',
        lg: '500px',
        default: '50vw',
      }
    )
  })

  it('parseSizes - setting default', () => {
    expect(picService['parseSizes']('lg:500px md:100vw')).toEqual({
      md: '100vw',
      lg: '500px',
      default: '100vw',
    })
  })
  it('parseSizes - setting default for empty', () => {
    expect(picService['parseSizes']()).toEqual({
      default: '100vw',
    })
  })

  it('stringifySizes - return only default if it is not 100vw', () => {
    expect(
      picService.stringifySizes({
        default: '50vw',
      })
    ).toEqual('50vw')
  })

  it('stringifySizes - empty sizes if only default 100vw given', () => {
    expect(picService.stringifySizes({ default: '100vw' })).toEqual('')
  })

  it('stringifySizes - correct breakpoints', () => {
    const testSizes = {
      xs: '100px',
      sm: '200px',
      md: '300px',
      lg: '400px',
      xl: '500px',
      xxl: '600px',
      default: '100vw',
    }

    expect(picService.stringifySizes(testSizes)).toEqual(
      '(min-width: 100px) 100px, (min-width: 200px) 200px, (min-width: 300px) 300px, (min-width: 400px) 400px, (min-width: 500px) 500px, (min-width: 600px) 600px, 100vw'
    )
  })

  it('resizeByWidth - changes up and down', () => {
    expect(picService.resizeByWidth(100, 100, 50)).toEqual({
      width: 50,
      height: 50,
    })
    expect(picService.resizeByWidth(100, 100, 200)).toEqual({
      width: 200,
      height: 200,
    })
  })

  it('resizeByWidth - changes to integer size', () => {
    expect(picService.resizeByWidth(2, 1, 3)).toEqual({
      width: 4,
      height: 2,
    })
  })

  it('genSrcSet - for no sizes', () => {
    const defaultSrcSet = Array(6)
      .fill(0)
      .map((_, i) => {
        const s = (i + 1) * 100
        return {
          height: s,
          size: `${s}w`,
          src: `test(${s}x${s})`,
          width: s,
        }
      })
    expect(picService.genSrcSet('test', 100, 100, {})).toEqual(defaultSrcSet)
  })
  it('genSrcSet - for no sizes with multiplier', () => {
    const defaultSrcSet = [
      ...Array(6)
        .fill(0)
        .map((_, i) => {
          const s = (i + 1) * 100
          return {
            height: s,
            size: `${s}w`,
            src: `test(${s}x${s})`,
            width: s,
          }
        }),
      ...Array(6)
        .fill(0)
        .map((_, i) => {
          const s = (i + 1) * 2 * 100
          return {
            height: s,
            size: `${s}w`,
            src: `test(${s}x${s})`,
            width: s,
          }
        }),
    ]
      .filter(
        (el, index, self) =>
          self.findIndex((els) => els.src === el.src) === index
      )
      .sort((a, b) => a.width - b.width)

    expect(picService.genSrcSet('test', 100, 100, {}, [2])).toEqual(
      defaultSrcSet
    )
  })

  it('genSrcSet - for 50vw', () => {
    expect(
      picService.genSrcSet('test', 100, 100, {
        default: '50vw',
      })
    ).toEqual([
      {
        height: 50,
        size: '50w',
        src: 'test(50x50)',
        width: 50,
      },
      {
        height: 100,
        size: '100w',
        src: 'test(100x100)',
        width: 100,
      },
      {
        height: 150,
        size: '150w',
        src: 'test(150x150)',
        width: 150,
      },
      {
        height: 200,
        size: '200w',
        src: 'test(200x200)',
        width: 200,
      },
      {
        height: 250,
        size: '250w',
        src: 'test(250x250)',
        width: 250,
      },
      {
        height: 300,
        size: '300w',
        src: 'test(300x300)',
        width: 300,
      },
    ])
  })

  it('genSrcSet - for md:50vw', () => {
    expect(
      picService.genSrcSet('test', 100, 100, {
        md: '50vw',
        default: '100vw',
      })
    ).toEqual([
      {
        height: 100,
        size: '100w',
        src: 'test(100x100)',
        width: 100,
      },
      {
        height: 150,
        size: '150w',
        src: 'test(150x150)',
        width: 150,
      },
      {
        height: 200,
        size: '200w',
        src: 'test(200x200)',
        width: 200,
      },
      {
        height: 250,
        size: '250w',
        src: 'test(250x250)',
        width: 250,
      },
      {
        height: 300,
        size: '300w',
        src: 'test(300x300)',
        width: 300,
      },
    ])
  })

  it('genSrcSet - for md:500px lg:1000px', () => {
    expect(
      picService.genSrcSet('test', 100, 100, {
        sm: '100vw',
        md: '100vw',
        lg: '500px',
        default: '50vw',
      })
    ).toEqual([
      {
        height: 50,
        size: '50w',
        src: 'test(50x50)',
        width: 50,
      },
      {
        height: 200,
        size: '200w',
        src: 'test(200x200)',
        width: 200,
      },
      {
        height: 300,
        size: '300w',
        src: 'test(300x300)',
        width: 300,
      },
      {
        height: 500,
        size: '500w',
        src: 'test(500x500)',
        width: 500,
      },
    ])
  })

  it('genSrcSet - all 100vw equal to no sizes', () => {
    expect(
      picService.genSrcSet('test', 100, 100, {
        sm: '100vw',
        md: '100vw',
        lg: '100vw',
        default: '100vw',
      })
    ).toEqual(picService.genSrcSet('test', 100, 100, {}))
  })

  it('genSrcSet - all 100vw equal to no sizes', () => {
    expect(
      picService.stringifySrcSet([
        {
          height: 50,
          size: '50w',
          src: 'test(50x50)',
          width: 50,
        },
        {
          height: 200,
          size: '200w',
          src: 'test(200x200)',
          width: 200,
        },
        {
          height: 300,
          size: '300w',
          src: 'test(300x300)',
          width: 300,
        },
        {
          height: 500,
          size: '500w',
          src: 'test(500x500)',
          width: 500,
        },
      ])
    ).toEqual(
      'test(50x50) 50w, test(200x200) 200w, test(300x300) 300w, test(500x500) 500w'
    )
  })
})
