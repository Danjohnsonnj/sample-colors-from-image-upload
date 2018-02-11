import Sampler from './ImageSampler'

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

export default ImagePreview