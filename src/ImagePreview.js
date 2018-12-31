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
      const colors = this.getColors()
      // const gradientCoords = this.getGradientCoords()
      // const gradientString = this.getGradientString({ colors, gradientCoords, })
      // const swatches = this.buildSwatches({ colors, gradientString, })
      console.table(colors)
      // console.table(gradientCoords)
      // console.info(gradientString)
      // console.info(swatches)
      // this.swatchWrapper.appendChild(swatches)
      this.swatchWrapper.appendChild(this.gradientStyles(colors))
    })
    image.src = window.URL.createObjectURL(curFile)

    this.preview.appendChild(image)
  }

  gradientStyles(colors) {
    const rows = ['before', null, 'after',]
    const numPerRow = Math.sqrt(colors.length)
    this.swatchWrapper.innerHTML = ''
    const style = document.createElement('style')
    const inner = document.createElement('div')
    this.swatchWrapper.appendChild(style)
    let css = `
      .swatches {
        --blurAmount: 6vw;
        background-color: ${ this.sampler.getAverageOfColors(colors) };
      }
      .swatches > div::before,
      .swatches > div::after {
        content: '';
        display: block;
        width: 100%;
        height: calc(100% / ${ numPerRow });
      }
    `
    rows.forEach((item, index) => {
      const rowColors = []
      css += item ? `.swatches > div::${ item } {` : '.swatches > div {'
      for (let ii = 0; ii < numPerRow; ii++) {
        rowColors.push(colors[index * 3 + ii])
        console.log(colors[index * 3 + ii])
      }
      css += `
        background-image: linear-gradient(
          to right,
          ${ rowColors[0] } 0%,
          ${ rowColors[0] } 33%,
          ${ rowColors[1] } 33%,
          ${ rowColors[1] } 67%,
          ${ rowColors[2] } 67%,
          ${ rowColors[2] } 100%
        );
      `
      css += '}'
    })

    style.innerHTML = css
    return inner
  }

  getColors() {
    const sampleSize = this._samples
    const width = this.sampler.canvas.width - 1
    const height = this.sampler.canvas.height - 1
    const colors = []
    const length = sampleSize - 1
    for (let h = 0; h <= length; h++) {
      for (let w = 0; w <= length; w++) {
        colors.push(this.sampler.getSampleAverageColor(
          Math.floor(width * w / length),
          Math.floor(height * h / length)
        ))
      }
    }

    return colors
  }

  getGradientCoords() {
    const sampleSize = this._samples
    const length = sampleSize - 1
    const gradientCoords = []
    for (let h = 0; h <= length; h++) {
      for (let w = 0; w <= length; w++) {
        gradientCoords.push(`${(w * 100 / sampleSize) + (100 / sampleSize / 2)}%
        ${(h * 100 / sampleSize) + (100 / sampleSize / 2)}%`)
      }
    }
    return gradientCoords
  }

  getGradientString({ colors, gradientCoords, }) {
    let gradientArray = []
    const sampleSize = this._samples
    const vanishingPoint = Math.floor(100 / sampleSize) * 1.2
    colors.forEach((c, x) => {
      gradientArray.push(`radial-gradient(circle at ${gradientCoords[x]}, ${colors[x]} 0%,
        ${this.sampler.chroma(colors[x]).alpha(0).css()} ${vanishingPoint}%)`)
    })

    const gMid = Math.floor(gradientArray.length / 2)
    const gRange = Math.floor(Math.sqrt(gradientArray.length) / 2)
    const gradientString = gradientArray.reduce((acc, i, d, a) => {
      if (Math.abs(d - gMid) < gRange) {
        acc.unshift(a.slice(d, d + 1)[0])
      } else {
        acc.push(i)
      }
      return acc
    }, []).join()

    return gradientString
  }

  buildSwatches({ colors, gradientString, }) {
    this.swatchWrapper.style.backgroundImage = gradientString
    this.swatchWrapper.style.backgroundColor = this.sampler.getAverageOfColors(colors)

    const sampleSize = this._samples
    const imageRatio = this.sampler.getImageRatio()
    const wrap = document.createElement('div')
    colors.forEach((c, x) => {
      const tile = document.createElement('div')
      tile.classList.add('tile')
      tile.style.backgroundColor = c
      tile.style.flexBasis = `${100 / sampleSize}%`
      tile.style.paddingBottom = `calc(${100 / sampleSize}% * ${imageRatio})`
      wrap.appendChild(tile)
    })

    return wrap
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