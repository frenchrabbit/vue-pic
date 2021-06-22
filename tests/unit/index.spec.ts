import './__mocks__/intersection-observer'
import { createLocalVue } from '@vue/test-utils'
import { VuePic } from '../../plugin'

const Vue = createLocalVue()
describe('plugin', () => {
  it('Plugins istalls withour errors without settings', () => {
    expect(() => {
      Vue.use(VuePic)
    }).not.toThrowError()
  })
})
