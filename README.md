# vue-pic - smart img/picture component with lazy and srcset

## Installation
```
yarn add vue-pic-comp
```
```
npm install --save vue-pic-comp
```

### Usage
In your main.js
```javascript
import Vue from 'vue'
import VuePic from 'vue-pic-comp'

Vue.use(VuePic, {
  tagname: 'pic',
  offset: 100,
  enlarge: false,
  // use for sizes
  screens: {
    xs: 320,
    sm: 640,
    md: 968,
    lg: 1024,
    xl: 1440,
    xxl: 1920,
  },
  srcProcessor: {
    src: (src, width, height) => src,
    readySrc: (src, width, height) =>
      `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20${width}%20${height}'%3E%3C/svg%3E`,
    loadingSrc: (src, width, height) =>
      `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20${width}%20${height}'%3E%3C/svg%3E`,
    errorSrc: (src, width, height) =>
      `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20${width}%20${height}'%3E%3C/svg%3E`,
  },
})
//...
```


### Single image
```html
<pic 
    src="https://placehold.it/1000x200" 
    sizes="md:50vw 100vw" 
    width="100" 
    height="100" />
```
will output
```html
<img 
    src="https://placehold.it/1000x200" 
    srcset="...."
    sizes="(min-width: 968px) 50vw, 100vw" 
    width="100" 
    height="100" />
```

### Compiles and minifies for production
```
yarn build
```

### Run your unit tests
```
yarn test:unit
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
