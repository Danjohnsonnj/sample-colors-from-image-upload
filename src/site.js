import chroma from 'chroma-js'

class Sampler {
  constructor(sampleSize = 50) {
    this.canvas = this.getCleanCanvas()
    this.ctx = this.canvas.getContext('2d')
    this.sampleSize = sampleSize
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
    this.canvas.width = img.naturalWidth
    this.canvas.height = img.naturalHeight
    this.ctx.drawImage(img, 0, 0)
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
    console.log(x, y, x + width, y + height)

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
    const mergedConfig = Object.assign({
      input: document.querySelector('input'),
      preview: document.querySelector('.preview'),
      swatches: document.querySelector('.swatches'),
      samples: 3,
      sampleSize: 50
    }, config)
    this.input = mergedConfig.input
    this.preview = mergedConfig.preview
    this.swatchWrapper = mergedConfig.swatches
    this.samples = mergedConfig.samples
    this.sampleSize = mergedConfig.sampleSize
    this.fileTypes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png'
    ]

    // input.style.opacity = 0
    this.bindListeners()
    this.sampler = new Sampler(this.sampleSize)
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
    console.log(width, height)
    const colors = []
    const length = this.samples - 1
    for (let h = 0; h <= length; h++) {
      for (let w = 0; w <= length; w++) {
        colors.push(this.sampler.getColorAverage(
          Math.floor(width * w / (this.samples - 1)),
          Math.floor(height * h / (this.samples - 1))
        ))
      }
    }

    const imageRatio = this.sampler.getImageRatio()
    const wrap = document.createElement('div')
    colors.forEach((c) => {
      const tile = document.createElement('div')
      tile.classList.add('tile')
      tile.style.backgroundColor = c
      tile.style.flexBasis = `${100 / this.samples}%`
      tile.style.paddingBottom = `calc(${100 / this.samples}% * ${imageRatio})`
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
}

document.addEventListener('DOMContentLoaded', () => {
  window.previewer = new ImagePreview({ samples: 5, sampleSize: 100 })
})
