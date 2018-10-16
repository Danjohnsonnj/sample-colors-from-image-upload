import Sampler from './ImageSampler'

class ImagePreview {
  constructor(config) {
    this.sampler = new Sampler()
    const mergedConfig = Object.assign({
      input: document.querySelector('input[name="image_uploads"]'),
      preview: document.querySelector('.preview'),
      swatches: document.querySelector('.swatches'),
      samples: 3,
      sampleSize: 50,
    }, config)
    this.input = mergedConfig.input
    this.preview = mergedConfig.preview
    this.swatchWrapper = mergedConfig.swatches
    this.samples = mergedConfig.samples
    this.sampleSize = mergedConfig.sampleSize
    this.fileTypes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
    ]

    this.bindListeners()
  }

  bindListeners() {
    this.input.addEventListener('change', this.updateImageDisplay.bind(this))
    this.swatchWrapper.addEventListener('click', evt => {
      evt.currentTarget.classList.toggle('over')
    })
  }

  validFileType(file) {
    if (!file) {
      return false
    }
    for (var i = 0; i < this.fileTypes.length; i++) {
      if (file.type === this.fileTypes[i]) {
        return true
      }
    }

    return false
  }

  updateImageDisplay() {
    var curFile = this.input.files[0]
    if (!this.validFileType(curFile)) {
      return false
    }
    while (this.preview.firstChild) {
      this.preview.removeChild(this.preview.firstChild)
    }
    this.swatchWrapper.innerHTML = ''
    this.swatchWrapper.style.backgroundColor = ''
    this.swatchWrapper.style.backgroundImage = ''
    let image = null
    image = document.createElement('img')
    image.addEventListener('load', () => {
      this.sampler.drawImageToCanvas(image)
      this.showSwatches(image)
    })
    image.src = window.URL.createObjectURL(curFile)

    this.preview.appendChild(image)
  }

  showSwatches(image) {
    const sampleSize = this._samples
    const width = this.sampler.canvas.width - 1
    const height = this.sampler.canvas.height - 1
    const colors = []
    const gradientCoords = []
    const length = sampleSize - 1
    for (let h = 0; h <= length; h++) {
      for (let w = 0; w <= length; w++) {
        colors.push(this.sampler.getSampleAverageColor(
          Math.floor(width * w / length),
          Math.floor(height * h / length)
        ))
        gradientCoords.push(`${(w * 100 / sampleSize) + (100 / sampleSize / 2)}%
          ${(h * 100 / sampleSize) + (100 / sampleSize / 2)}%`)
        // console.log(gradientCoords[gradientCoords.length - 1])
      }
    }

    let gradientArray = []
    const vanishingPoint = Math.floor(100 / sampleSize) * 1.2
    const imageRatio = this.sampler.getImageRatio()
    const wrap = document.createElement('div')
    colors.forEach((c, x) => {
      const tile = document.createElement('div')
      tile.classList.add('tile')
      tile.style.backgroundColor = c
      tile.style.flexBasis = `${100 / sampleSize}%`
      tile.style.paddingBottom = `calc(${100 / sampleSize}% * ${imageRatio})`
      wrap.appendChild(tile)

      gradientArray.push(`radial-gradient(circle at ${gradientCoords[x]}, ${colors[x]} 0%,
        ${this.sampler.chroma(colors[x]).alpha(0).css()} ${vanishingPoint}%)`)
    })

    const gMid = Math.floor(gradientArray.length / 2)
    const gRange = Math.floor(Math.sqrt(gradientArray.length) / 2)
    const acc = []
    gradientArray.forEach((i, d, a) => {
      if (Math.abs(d - gMid) < gRange) {
        acc.unshift(a.slice(d, d + 1)[0])
      } else {
        acc.push(i)
      }
    })
    const gradientString = acc.join()
    this.swatchWrapper.style.backgroundImage = gradientString
    this.swatchWrapper.style.backgroundColor = this.sampler.getAverageOfColors(colors)
    this.swatchWrapper.appendChild(wrap)
  }

  set samples(num) {
    if (this.sampler) {
      this.sampler.samples = num
    }
    this._samples = num
  }

  set sampleSize(num) {
    if (this.sampler) {
      this.sampler.sampleSize = num
    }
  }
}

export default ImagePreview