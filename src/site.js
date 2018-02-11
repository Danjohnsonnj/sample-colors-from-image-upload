import chroma from 'chroma-js'

const DEFAULTS = {
  samples: 5, sampleSize: 50
}

class Sampler {
  constructor(sampleSize = DEFAULTS.sampleSize, samples = DEFAULTS.samples) {
    this.canvas = this.getCleanCanvas()
    this.ctx = this.canvas.getContext('2d')
    this.sampleSize = sampleSize
    this.samples = samples
  }

  getCleanCanvas() {
    if (this.canvas) {
      this.clearCanvas()
      return this.canvas
    }
    const canvas = document.createElement('canvas')
    canvas.classList.add('sampler')
    document.body.appendChild(canvas)
    return canvas
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawImageToCanvas(img) {
    this.getCleanCanvas()
    this.canvas.width = 1000
    this.canvas.height = 1000 * img.naturalHeight / img.naturalWidth
    this.sampleSize = Math.min(
      this.sampleSize,
      Math.floor(this.canvas.width / this.samples),
      Math.floor(this.canvas.height / this.samples)
    )
    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
  }

  getColorDataAtPoint(x, y, imageData) {
    const red = y * (imageData.width * 4) + x * 4
    const [redIndex, greenIndex, blueIndex, alphaIndex] = [red, red + 1, red + 2, red + 3]
    return [imageData.data[redIndex],
      imageData.data[greenIndex],
      imageData.data[blueIndex],
      imageData.data[alphaIndex] / 255]
  }

  getColorAverage(x, y) {
    const width = this.sampleSize
    const height = this.sampleSize

    x = Math.min(Math.max(0, x - width / 2), this.canvas.width - 1 - width)
    y = Math.min(Math.max(0, y - height / 2), this.canvas.height - 1 - height)

    const imageData = this.ctx.getImageData(x, y, x + width, y + height)
    const colors = []
    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        colors.push(this.getColorDataAtPoint(w, h, imageData))
      }
    }
    return chroma.average(colors).css()
  }

  getImageRatio() {
    return this.canvas.height / this.canvas.width
  }
}

class ImagePreview {
  constructor(config) {
    this.sampler = new Sampler()
    const mergedConfig = Object.assign({
      input: document.querySelector('input'),
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
    const length = this._samples - 1
    for (let h = 0; h <= length; h++) {
      for (let w = 0; w <= length; w++) {
        colors.push(this.sampler.getColorAverage(
          Math.floor(width * w / (this._samples - 1)),
          Math.floor(height * h / (this._samples - 1))
        ))
      }
    }

    const imageRatio = this.sampler.getImageRatio()
    const wrap = document.createElement('div')
    colors.forEach((c) => {
      const tile = document.createElement('div')
      tile.classList.add('tile')
      tile.style.backgroundColor = c
      tile.style.flexBasis = `${100 / this._samples}%`
      tile.style.paddingBottom = `calc(${100 / this._samples}% * ${imageRatio})`
      wrap.appendChild(tile)
    })
    this.swatchWrapper.appendChild(wrap)
  }

  returnFileSize(number) {
    if (number < 1024) {
      return number + 'bytes';
    } else if (number > 1024 && number < 1048576) {
      return (number / 1024).toFixed(1) + 'KB';
    } else if (number > 1048576) {
      return (number / 1048576).toFixed(1) + 'MB';
    }
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

document.addEventListener('DOMContentLoaded', () => {
  window.previewer = new ImagePreview({ samples: DEFAULTS.samples, sampleSize: DEFAULTS.sampleSize })
})
