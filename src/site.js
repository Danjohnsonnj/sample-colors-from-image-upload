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

  inputSamples.nextElementSibling.innerHTML = `${inputSamples.value} x ${inputSamples.value}`
  inputSampleSize.nextElementSibling.innerHTML = inputSampleSize.value

  inputSamples.addEventListener('change', evt => {
    evt.currentTarget.nextElementSibling.innerHTML = `${evt.currentTarget.value} x ${evt.currentTarget.value}`
    window.previewer.samples = evt.currentTarget.value
    if (window.previewer.preview.firstElementChild) { buttonSet.classList.add('changes') }
  })

  inputSampleSize.addEventListener('change', evt => {
    evt.currentTarget.nextElementSibling.innerHTML = evt.currentTarget.value
    window.previewer.sampleSize = evt.currentTarget.value
    if (window.previewer.preview.firstElementChild) { buttonSet.classList.add('changes') }
  })

  buttonSet.addEventListener('click', evt => {
    evt.preventDefault()
    evt.currentTarget.classList.remove('changes')
    window.previewer.samples = inputSamples.value
    window.previewer.sampleSize = inputSampleSize.value
    window.previewer.updateImageDisplay()
  })

})
