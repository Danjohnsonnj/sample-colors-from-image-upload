import Sampler from './ImageSampler'

class ImagePreview {
  constructor(config) {
    this.sampler = new Sampler()
    const mergedConfig = Object.assign({
      input: document.querySelector('input[name="image_uploads"]'),
      preview: document.querySelector('.preview'),
      swatches: document.querySelector('.swatches'),
      progress: document.querySelector('.progress'),
      samples: 3,
      sampleSize: 50
    }, config)
    this.input = mergedConfig.input
    this.preview = mergedConfig.preview
    this.swatchWrapper = mergedConfig.swatches
    this.progress = mergedConfig.progress
    this.samples = mergedConfig.samples
    this.sampleSize = mergedConfig.sampleSize
    this.fileTypes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png'
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
    for (var i = 0; i < this.fileTypes.length; i++) {
      if (file.type === this.fileTypes[i]) {
        return true;
      }
    }

    return false;
  }

  updateImageDisplay() {
    while (this.preview.firstChild) {
      this.preview.removeChild(this.preview.firstChild);
    }
    this.swatchWrapper.innerHTML = ''
    this.swatchWrapper.style.backgroundColor = ''
    this.swatchWrapper.style.backgroundImage = ''
    var curFile = this.input.files[0]
    let image = null
    if (this.validFileType(curFile)) {
      image = document.createElement('img')
      image.addEventListener('load', () => {
        this.sampler.drawImageToCanvas(image)
        this.showSwatches(image)
      })
      image.src = window.URL.createObjectURL(curFile)

      this.preview.appendChild(image)
    }
  }

  showSwatches(image) {
    const width = this.sampler.canvas.width - 1
    const height = this.sampler.canvas.height - 1
    const colors = []
    const gradientCoords = []
    const length = this._samples - 1
    for (let h = 0; h <= length; h++) {
      for (let w = 0; w <= length; w++) {
        colors.push(this.sampler.getSampleAverageColor(
          Math.floor(width * w / length),
          Math.floor(height * h / length)
        ))
        gradientCoords.push(`${(w * 100 / this._samples) + (100 / this._samples / 2)}%
          ${(h * 100 / this._samples) + (100 / this._samples / 2)}%`)
        // console.log(gradientCoords[gradientCoords.length - 1])
      }
    }

    let gradientString = ''
    const vanishingPoint = Math.floor(100 / this._samples) * 1.1
    colors.forEach((c, x) => {
      gradientString += `radial-gradient(circle at ${gradientCoords[x]}, ${colors[x]} 0%,
        ${this.sampler.chroma(colors[x]).alpha(0).css()} ${vanishingPoint}%),`
    })
    gradientString = gradientString.slice(0, gradientString.lastIndexOf(','))
    // console.log(gradientString)
    this.swatchWrapper.style.backgroundImage = gradientString
    this.swatchWrapper.style.backgroundColor = this.sampler.getAverageOfColors(colors)
    const imageRatio = this.sampler.getImageRatio()
    const wrap = document.createElement('div')
    wrap.style.gridTemplateColumns = `repeat(${this._samples}, 1fr)`
    colors.forEach((c) => {
      const tile = document.createElement('div')
      tile.classList.add('tile')
      tile.style.backgroundColor = c
      tile.style.paddingBottom = `calc(${100 / this._samples}% * ${imageRatio})`
      wrap.appendChild(tile)
    })
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