import DEFAULTS from './defaults'
import ImagePreview from './ImagePreview'

document.addEventListener('DOMContentLoaded', () => {
  window.previewer = new ImagePreview({
    samples: DEFAULTS.samples,
    sampleSize: DEFAULTS.sampleSize
  })
})
