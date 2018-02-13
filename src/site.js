import DEFAULTS from './defaults'
import ImagePreview from './ImagePreview'

document.addEventListener('DOMContentLoaded', () => {
  window.previewer = new ImagePreview({
    samples: DEFAULTS.samples,
    sampleSize: DEFAULTS.sampleSize
  })

  const inputSamples = document.querySelector('input[name="samples"]')
  const inputSampleSize = document.querySelector('input[name="sampleSize"]')
  const buttonSet = document.querySelector('input[name="set"]')
  inputSamples.value = DEFAULTS.samples
  inputSampleSize.value = DEFAULTS.sampleSize

  buttonSet.addEventListener('click', evt => {
    evt.preventDefault()
    window.previewer.samples = inputSampleSize.value
    window.previewer.sampleSize = inputSampleSize.value
  })

})
